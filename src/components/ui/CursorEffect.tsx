'use client';
import { useEffect, useRef } from 'react';

export default function CursorEffect() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let ringX = 0, ringY = 0;
    let dotX = 0, dotY = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
    };

    const animate = () => {
      ringX += (dotX - ringX) * 0.12;
      ringY += (dotY - ringY) * 0.12;
      dot.style.left = dotX + 'px';
      dot.style.top = dotY + 'px';
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      raf = requestAnimationFrame(animate);
    };

    const onEnterHover = () => {
      dot.classList.add('hovering');
      ring.classList.add('hovering');
    };
    const onLeaveHover = () => {
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(animate);

    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', onEnterHover);
      el.addEventListener('mouseleave', onLeaveHover);
    });

    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [data-hover]').forEach(el => {
        el.addEventListener('mouseenter', onEnterHover);
        el.addEventListener('mouseleave', onLeaveHover);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
