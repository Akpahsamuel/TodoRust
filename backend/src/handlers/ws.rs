use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Query, State,
    },
    response::Response,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::Deserialize;
use tokio::sync::broadcast;
use uuid::Uuid;

use crate::{auth::jwt::decode_access_token, AppState};

#[derive(Debug, Deserialize)]
pub struct WsQuery {
    pub token: String,
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
    Query(query): Query<WsQuery>,
) -> Result<Response, crate::errors::AppError> {
    // Validate the JWT token from the query parameter
    let claims = decode_access_token(&query.token, &state.config.jwt_secret)?;

    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| crate::errors::AppError::Unauthorized("Invalid user ID in token".to_string()))?;

    Ok(ws.on_upgrade(move |socket| handle_socket(socket, state, user_id)))
}

async fn handle_socket(socket: WebSocket, state: AppState, user_id: Uuid) {
    let (mut sender, mut receiver) = socket.split();

    // Subscribe to the broadcast channel
    let rx = state
        .ws_tx
        .as_ref()
        .map(|tx| tx.subscribe())
        .unwrap_or_else(|| {
            let (dummy_tx, rx) = broadcast::channel(1);
            drop(dummy_tx);
            rx
        });

    let mut rx = rx;

    // Forward broadcast messages to this WebSocket client, filtered by user_id
    let mut send_task = tokio::spawn(async move {
        loop {
            match rx.recv().await {
                Ok(msg) => {
                    // Parse the message to check the user_id field
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&msg) {
                        if let Some(msg_user_id) = parsed.get("user_id").and_then(|v| v.as_str()) {
                            if msg_user_id != user_id.to_string() {
                                // Message belongs to a different user, skip it
                                continue;
                            }
                        }
                        // Strip the user_id from the outgoing message to keep it internal
                        let mut outgoing = parsed.clone();
                        if let Some(obj) = outgoing.as_object_mut() {
                            obj.remove("user_id");
                        }
                        if sender
                            .send(Message::Text(outgoing.to_string()))
                            .await
                            .is_err()
                        {
                            break;
                        }
                    }
                }
                Err(broadcast::error::RecvError::Closed) => break,
                Err(broadcast::error::RecvError::Lagged(_)) => continue,
            }
        }
    });

    // Drain incoming messages (keep connection alive)
    let mut recv_task = tokio::spawn(async move {
        while let Some(msg) = receiver.next().await {
            match msg {
                Ok(Message::Close(_)) | Err(_) => break,
                _ => {} // ignore ping/pong, text from client
            }
        }
    });

    // If either task finishes, abort the other
    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    }
}
