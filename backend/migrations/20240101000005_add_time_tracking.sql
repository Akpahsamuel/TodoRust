-- Add time tracking fields to todos table
ALTER TABLE todos
    ADD COLUMN started_at TIMESTAMPTZ,
    ADD COLUMN completed_at TIMESTAMPTZ,
    ADD COLUMN time_elapsed_seconds BIGINT DEFAULT 0;

-- Add index for analytics queries
CREATE INDEX idx_todos_started_at ON todos(started_at) WHERE started_at IS NOT NULL;
CREATE INDEX idx_todos_completed_at ON todos(completed_at) WHERE completed_at IS NOT NULL;

-- Update existing todos based on their current status
UPDATE todos
SET started_at = created_at
WHERE status = 'in_progress' AND started_at IS NULL;

UPDATE todos
SET completed_at = updated_at
WHERE status = 'completed' AND completed_at IS NULL;
