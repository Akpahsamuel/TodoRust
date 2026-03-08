import confetti from 'canvas-confetti';

export function fireConfetti() {
    // Quick burst from center-bottom
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7, x: 0.5 },
        colors: ['#E2FF00', '#FF7F3E', '#60a5fa', '#34d399', '#f472b6', '#a78bfa'],
        ticks: 150,
        gravity: 1.2,
        scalar: 0.9,
        shapes: ['circle', 'square'],
    });

    // Delayed side bursts
    setTimeout(() => {
        confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.65 },
            colors: ['#E2FF00', '#FF7F3E', '#34d399'],
            ticks: 120,
        });
        confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.65 },
            colors: ['#E2FF00', '#60a5fa', '#f472b6'],
            ticks: 120,
        });
    }, 150);
}
