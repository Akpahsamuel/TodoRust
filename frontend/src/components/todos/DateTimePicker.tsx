import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, setHours, setMinutes } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';

interface Props {
    value?: string;
    onChange: (val: string) => void;
}

export function DateTimePicker({ value, onChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => value ? new Date(value) : new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
    const [time, setTime] = useState(() => value ? format(new Date(value), 'HH:mm') : '12:00');

    useEffect(() => {
        if (value) {
            const d = new Date(value);
            setSelectedDate(d);
            setTime(format(d, 'HH:mm'));
            setCurrentMonth(d);
        }
    }, [value]);

    const handleSave = () => {
        if (selectedDate) {
            const [hours, minutes] = time.split(':').map(Number);
            const finalDate = setMinutes(setHours(selectedDate, hours), minutes);
            onChange(finalDate.toISOString());
        }
        setIsOpen(false);
    };

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="input-square flex items-center justify-between gap-3 text-left w-full h-12 px-4 transition-colors"
                style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
                <div className="flex items-center gap-3 truncate">
                    <Calendar size={16} />
                    <span className="truncate text-sm font-medium">
                        {value ? format(new Date(value), 'MMM d, yyyy h:mm a') : 'Select date & time...'}
                    </span>
                </div>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pb-12 sm:pb-4"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                    onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
                    <div className="w-full max-w-[340px] animate-scale-in flex flex-col shadow-2xl max-h-[85dvh] overflow-y-auto pb-32 sm:pb-0"
                        style={{ background: 'var(--surface)', borderRadius: '28px', border: '1px solid var(--border)' }}>

                        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                            <h3 className="font-bold text-[0.8rem] tracking-[0.1em] uppercase text-[var(--text-secondary)]">Due Date</h3>
                            <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost p-2 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-5">
                                <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-[var(--surface-2)] hover:bg-[var(--border)] rounded-full transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="font-bold text-[15px]">{format(currentMonth, 'MMMM yyyy')}</span>
                                <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-[var(--surface-2)] hover:bg-[var(--border)] rounded-full transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Days Header */}
                            <div className="grid grid-cols-7 gap-1 mb-3">
                                {days.map(d => (
                                    <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] pb-2">{d}</div>
                                ))}
                            </div>

                            {/* Date Grid */}
                            <div className="grid grid-cols-7 gap-1 gap-y-2">
                                {dateInterval.map(day => {
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const isCurrentMonth = isSameMonth(day, currentMonth);

                                    let btnClass = "w-9 h-9 mx-auto rounded-full flex items-center justify-center text-[13px] font-bold transition-all ";
                                    if (isSelected) {
                                        btnClass += "bg-[var(--accent)] text-black shadow-[0_4px_16px_var(--accent-glow)]";
                                    } else if (!isCurrentMonth) {
                                        btnClass += "text-[var(--text-muted)] opacity-30 font-medium";
                                    } else {
                                        btnClass += "hover:bg-[var(--surface-2)] text-[var(--text-primary)]";
                                    }

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            type="button"
                                            onClick={() => setSelectedDate(day)}
                                            className={btnClass}
                                        >
                                            {format(day, 'd')}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time Selector */}
                            <div className="mt-6 pt-5 flex items-center gap-4" style={{ borderTop: '1px solid var(--border)' }}>
                                <Clock size={18} style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="flex-1 text-center font-mono text-[16px] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-xl py-3 transition-all tracking-widest"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            {/* Actions */}
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!selectedDate}
                                className="btn-accent w-full mt-6 h-12 text-[14px]"
                            >
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
