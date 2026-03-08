import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';
import gsap from 'gsap';

interface FocusTimerProps {
    taskTitle: string;
    onClose: () => void;
}

const PRESETS = [
    { label: '15m', seconds: 15 * 60 },
    { label: '25m', seconds: 25 * 60 },
    { label: '45m', seconds: 45 * 60 },
    { label: '60m', seconds: 60 * 60 },
];

export function FocusTimer({ taskTitle, onClose }: FocusTimerProps) {
    const [totalSeconds, setTotalSeconds] = useState(25 * 60);
    const [remaining, setRemaining] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // GSAP entrance
    useEffect(() => {
        if (!backdropRef.current || !panelRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(panelRef.current,
                { y: 60, opacity: 0, scale: 0.92 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)', delay: 0.1 },
            );
        });
        return () => ctx.revert();
    }, []);

    const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const tick = useCallback(() => {
        setRemaining((prev) => {
            if (prev <= 1) {
                setIsRunning(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
                // Play a subtle notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Focus session complete!', { body: taskTitle });
                }
                return 0;
            }
            return prev - 1;
        });
    }, [taskTitle]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(tick, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning, tick]);

    const selectPreset = (secs: number) => {
        setTotalSeconds(secs);
        setRemaining(secs);
        setIsRunning(false);
        setHasStarted(false);
    };

    const toggleTimer = () => {
        if (!hasStarted) setHasStarted(true);
        setIsRunning((r) => !r);
    };

    const resetTimer = () => {
        setRemaining(totalSeconds);
        setIsRunning(false);
        setHasStarted(false);
    };

    // SVG ring dimensions
    const size = 220;
    const stroke = 8;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (progress / 100) * circumference;

    return (
        <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
            <div
                ref={panelRef}
                className="w-full max-w-sm mx-4 rounded-3xl p-6 flex flex-col items-center"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(40px)',
                }}
            >
                {/* Header */}
                <div className="w-full flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Timer size={16} style={{ color: 'var(--accent)' }} />
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Focus Mode</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <X size={14} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                </div>

                {/* Task name */}
                <p className="text-xs font-medium mb-6 text-center truncate w-full" style={{ color: 'var(--text-muted)' }}>
                    {taskTitle}
                </p>

                {/* Timer ring */}
                <div className="relative mb-6" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="transform -rotate-90">
                        {/* Background ring */}
                        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                        {/* Progress ring */}
                        <circle
                            cx={size / 2} cy={size / 2} r={radius} fill="none"
                            stroke={remaining === 0 ? '#34d399' : 'var(--accent)'}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    {/* Time display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black tabular-nums" style={{ color: remaining === 0 ? '#34d399' : 'var(--text-primary)' }}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                        {remaining === 0 && (
                            <span className="text-sm font-semibold mt-1" style={{ color: '#34d399' }}>Complete!</span>
                        )}
                    </div>
                </div>

                {/* Preset chips (only before starting) */}
                {!hasStarted && (
                    <div className="flex gap-2 mb-6">
                        {PRESETS.map(({ label, seconds: secs }) => (
                            <button
                                key={label}
                                onClick={() => selectPreset(secs)}
                                className="px-4 py-2 rounded-full text-xs font-bold transition-all"
                                style={{
                                    background: totalSeconds === secs ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                                    color: totalSeconds === secs ? '#000' : 'var(--text-secondary)',
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-4">
                    {hasStarted && (
                        <button
                            onClick={resetTimer}
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            <RotateCcw size={18} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                    )}
                    <button
                        onClick={toggleTimer}
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                            background: remaining === 0 ? '#34d399' : 'var(--accent)',
                            boxShadow: `0 4px 24px ${remaining === 0 ? 'rgba(52,211,153,0.3)' : 'var(--accent-glow)'}`,
                        }}
                        disabled={remaining === 0}
                    >
                        {isRunning
                            ? <Pause size={24} color="#000" strokeWidth={2.5} />
                            : <Play size={24} color="#000" strokeWidth={2.5} style={{ marginLeft: 2 }} />
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
