import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Animate children of a container with a staggered reveal.
 * Each direct child slides up and fades in.
 */
export function useStaggerReveal<T extends HTMLElement>(deps: unknown[] = []) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!ref.current) return;
        const children = ref.current.children;
        if (children.length === 0) return;

        gsap.fromTo(
            children,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power3.out',
                clearProps: 'transform',
            },
        );
    }, deps);

    return ref;
}

/**
 * Simple fade-slide-in on mount.
 */
export function useFadeIn<T extends HTMLElement>(delay = 0) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!ref.current) return;
        gsap.fromTo(
            ref.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, delay, ease: 'power3.out', clearProps: 'transform' },
        );
    }, [delay]);

    return ref;
}

/**
 * Floating animation — gentle y oscillation + slight rotation.
 * Great for decorative elements.
 */
export function useFloat<T extends HTMLElement>(amplitude = 12, duration = 3, delay = 0) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!ref.current) return;
        const tl = gsap.timeline({ repeat: -1, yoyo: true, delay });
        tl.to(ref.current, {
            y: `-=${amplitude}`,
            rotation: '+=2',
            duration,
            ease: 'sine.inOut',
        });
        return () => { tl.kill(); };
    }, [amplitude, duration, delay]);

    return ref;
}

/**
 * Number counter animation — counts from 0 to target value.
 */
export function useCountUp(target: number, duration = 1) {
    const ref = useRef<HTMLElement>(null);
    const prevTarget = useRef(0);

    useEffect(() => {
        if (!ref.current) return;
        const obj = { val: prevTarget.current };
        gsap.to(obj, {
            val: target,
            duration,
            ease: 'power2.out',
            onUpdate: () => {
                if (ref.current) ref.current.textContent = String(Math.round(obj.val));
            },
        });
        prevTarget.current = target;
    }, [target, duration]);

    return ref;
}

/**
 * Magnetic hover effect — element follows cursor slightly on hover.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(el, { x: x * strength, y: y * strength, duration: 0.3, ease: 'power2.out' });
        };

        const handleLeave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        };

        el.addEventListener('mousemove', handleMove);
        el.addEventListener('mouseleave', handleLeave);
        return () => {
            el.removeEventListener('mousemove', handleMove);
            el.removeEventListener('mouseleave', handleLeave);
        };
    }, [strength]);

    return ref;
}
