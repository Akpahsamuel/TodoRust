import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GamificationState {
    xp: number;
    level: number;
    streak: number;
    lastCompletionDate: string | null; // ISO date string (YYYY-MM-DD)
    totalCompleted: number;
    completedTaskIds: string[]; // track which tasks have been rewarded
    addXp: (amount: number) => void;
    recordCompletion: (taskId: string) => void;
    hasBeenRewarded: (taskId: string) => boolean;
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

function levelFromXp(xp: number) {
    let level = 1;
    let needed = 100;
    let remaining = xp;
    while (remaining >= needed) {
        remaining -= needed;
        level++;
        needed = level * 100;
    }
    return level;
}

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            xp: 0,
            level: 1,
            streak: 0,
            lastCompletionDate: null,
            totalCompleted: 0,
            completedTaskIds: [],

            addXp: (amount: number) =>
                set((state) => {
                    const newXp = state.xp + amount;
                    return { xp: newXp, level: levelFromXp(newXp) };
                }),

            hasBeenRewarded: (taskId: string) =>
                get().completedTaskIds.includes(taskId),

            recordCompletion: (taskId: string) =>
                set((state) => {
                    // Already rewarded this task — skip
                    if (state.completedTaskIds.includes(taskId)) return state;

                    const today = getToday();
                    const yesterday = getYesterday();

                    let newStreak = state.streak;
                    if (state.lastCompletionDate === today) {
                        // Already completed a task today, streak stays
                    } else if (state.lastCompletionDate === yesterday) {
                        newStreak = state.streak + 1;
                    } else {
                        newStreak = 1;
                    }

                    const xpGain = 25 + (newStreak >= 3 ? 10 : 0) + (newStreak >= 7 ? 15 : 0);
                    const newXp = state.xp + xpGain;

                    return {
                        streak: newStreak,
                        lastCompletionDate: today,
                        totalCompleted: state.totalCompleted + 1,
                        xp: newXp,
                        level: levelFromXp(newXp),
                        completedTaskIds: [...state.completedTaskIds, taskId],
                    };
                }),
        }),
        {
            name: 'todoflow-gamification',
            merge: (persisted, current) => ({
                ...current,
                ...(persisted as Partial<GamificationState>),
            }),
        },
    ),
);

export function xpForNextLevel(level: number) {
    return level * 100;
}

export function xpInCurrentLevel(xp: number, level: number) {
    let spent = 0;
    for (let i = 1; i < level; i++) spent += i * 100;
    return xp - spent;
}
