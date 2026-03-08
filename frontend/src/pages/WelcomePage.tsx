import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clipboard, Briefcase, Compass, Layers, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { useMagnetic } from '../hooks/useGsap';

const FLOATING_CARDS = [
    { name: 'Development', icon: Clipboard, x: '-4%', y: '12%', rotate: -8, members: 10 },
    { name: 'Portfolio', icon: Briefcase, x: '25%', y: '32%', rotate: 3, members: 8 },
    { name: 'Discovery', icon: Compass, x: '54%', y: '52%', rotate: 6, members: 5 },
];

const ORBIT_ICONS = [
    { icon: Layers, x: '8%', y: '58%' },
    { icon: Clipboard, x: '46%', y: '16%' },
    { icon: Briefcase, x: '80%', y: '36%' },
];

export function WelcomePage() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
    const orbitsRef = useRef<(HTMLDivElement | null)[]>([]);
    const orbitRingsRef = useRef<(HTMLDivElement | null)[]>([]);
    const heroRef = useRef<HTMLDivElement>(null);
    const ctaBtnRef = useMagnetic<HTMLButtonElement>(0.15);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Master timeline
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // 1. Orbit rings scale in with rotation
            orbitRingsRef.current.forEach((ring, i) => {
                if (!ring) return;
                tl.fromTo(ring,
                    { scale: 0.6, opacity: 0, rotation: -30 },
                    { scale: 1, opacity: 1, rotation: 0, duration: 1.2 },
                    i * 0.1,
                );
            });

            // 2. Glass cards fly in from below with stagger + 3D feel
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                tl.fromTo(card,
                    { y: 100, opacity: 0, scale: 0.85, rotateX: 15 },
                    { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.8 },
                    0.15 + i * 0.15,
                );
            });

            // 3. Orbit icons pop in
            orbitsRef.current.forEach((orb, i) => {
                if (!orb) return;
                tl.fromTo(orb,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
                    0.5 + i * 0.1,
                );
            });

            // 4. Hero text words reveal
            if (heroRef.current) {
                const words = heroRef.current.querySelectorAll('.word');
                tl.fromTo(words,
                    { y: 60, opacity: 0, rotateX: 40 },
                    { y: 0, opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.07 },
                    0.4,
                );

                // Subtitle + CTA
                const extras = heroRef.current.querySelectorAll('.hero-fade');
                tl.fromTo(extras,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
                    '-=0.2',
                );
            }

            // 5. Infinite float animation on cards
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                gsap.to(card, {
                    y: '-=14',
                    rotation: `+=${i % 2 === 0 ? 2 : -2}`,
                    duration: 2.5 + i * 0.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: i * 0.3,
                });
            });

            // 6. Slow orbit rotation for small icons
            orbitsRef.current.forEach((orb, i) => {
                if (!orb) return;
                gsap.to(orb, {
                    y: '-=8',
                    x: `+=${i % 2 === 0 ? 6 : -6}`,
                    duration: 3 + i * 0.4,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                });
            });

            // 7. Slow breathing for orbit rings
            orbitRingsRef.current.forEach((ring, i) => {
                if (!ring) return;
                gsap.to(ring, {
                    scale: 1.03,
                    rotation: 5,
                    duration: 6 + i * 2,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                });
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-dvh flex flex-col overflow-hidden relative"
            style={{ background: '#050505', perspective: '800px' }}
        >
            {/* ── Orbit rings ── */}
            {[
                { top: '8%', size: '130vw', max: 650, opacity: 0.04 },
                { top: '14%', size: '90vw', max: 450, opacity: 0.035 },
                { top: '22%', size: '50vw', max: 260, opacity: 0.03 },
            ].map((ring, i) => (
                <div
                    key={i}
                    ref={(el) => { orbitRingsRef.current[i] = el; }}
                    className="absolute pointer-events-none"
                    style={{ top: ring.top, left: '50%', transform: 'translateX(-50%)' }}
                >
                    <div
                        className="rounded-full"
                        style={{
                            width: ring.size,
                            height: ring.size,
                            maxWidth: ring.max,
                            maxHeight: ring.max,
                            border: `1px solid rgba(255,255,255,${ring.opacity})`,
                        }}
                    />
                </div>
            ))}

            {/* ── Floating glass cards ── */}
            <div className="relative w-full" style={{ height: '52vh', minHeight: 380 }}>
                {FLOATING_CARDS.map(({ name, icon: Icon, x, y, rotate, members }, i) => (
                    <div
                        key={name}
                        ref={(el) => { cardsRef.current[i] = el; }}
                        className="absolute"
                        style={{
                            left: x,
                            top: y,
                            transform: `rotate(${rotate}deg)`,
                            zIndex: 2,
                            opacity: 0,
                        }}
                    >
                        <div
                            className="rounded-3xl p-4 flex flex-col gap-2.5"
                            style={{
                                width: 170,
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                            }}
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <Icon size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
                            </div>
                            <p className="text-sm font-bold" style={{ color: '#fff' }}>{name}</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Joined Members</p>
                            <div className="flex items-center">
                                <div className="flex -space-x-2">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <div
                                            key={j}
                                            className="w-7 h-7 rounded-full flex-shrink-0"
                                            style={{
                                                background: `hsl(${j * 80 + 180}, 35%, 42%)`,
                                                border: '2px solid rgba(20,20,20,0.8)',
                                            }}
                                        />
                                    ))}
                                </div>
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold -ml-2"
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '2px solid rgba(20,20,20,0.8)',
                                        color: 'rgba(255,255,255,0.5)',
                                        fontSize: '0.6rem',
                                    }}
                                >
                                    +{members}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Small orbit icons */}
                {ORBIT_ICONS.map(({ icon: Icon, x, y }, i) => (
                    <div
                        key={i}
                        ref={(el) => { orbitsRef.current[i] = el; }}
                        className="absolute"
                        style={{ left: x, top: y, opacity: 0 }}
                    >
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <Icon size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Hero text ── */}
            <div ref={heroRef} className="flex-1 flex flex-col justify-end px-6 pb-8" style={{ perspective: '600px' }}>
                <h1 className="text-5xl font-black leading-[1.1]" style={{ color: '#fff' }}>
                    <span className="word inline-block">Your </span>
                    <span className="word inline-block" style={{ color: 'var(--accent)' }}>Daily</span>
                    <span className="word inline-block ml-1" style={{ color: 'var(--accent)', fontSize: '1.5rem', verticalAlign: 'super' }}>&#x2728;</span>
                    <br />
                    <span className="word inline-block">Productivity</span>
                    <br />
                    <span className="word inline-block" style={{ color: 'var(--accent)' }}>Starts </span>
                    <span className="word inline-block">Here</span>
                </h1>

                <p
                    className="hero-fade mt-4 text-base leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 340, opacity: 0 }}
                >
                    Plan tasks, stay focused, and achieve your goals with simple daily organization.
                </p>

                {/* ── CTA Button ── */}
                <button
                    ref={ctaBtnRef}
                    onClick={() => navigate('/register')}
                    className="hero-fade mt-8 w-full flex items-center justify-between rounded-full"
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '6px 6px 6px 28px',
                        height: 64,
                        opacity: 0,
                    }}
                >
                    <span className="text-base font-semibold" style={{ color: '#fff' }}>
                        Get Started
                    </span>
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'var(--accent)',
                            boxShadow: '0 4px 20px var(--accent-glow)',
                        }}
                    >
                        <ChevronRight size={22} color="#000" strokeWidth={2.5} />
                    </div>
                </button>

                {/* Sign in link */}
                <p
                    className="hero-fade mt-4 text-center text-sm"
                    style={{ color: 'rgba(255,255,255,0.35)', opacity: 0 }}
                >
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="font-semibold"
                        style={{ color: 'var(--accent)' }}
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}
