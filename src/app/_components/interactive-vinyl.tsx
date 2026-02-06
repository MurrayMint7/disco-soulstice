"use client";

import { useEffect, useRef, useState } from "react";
import Hero from "./hero";

export function InteractiveVinyl() {
  const sectionRef = useRef<HTMLElement>(null);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const animationFrameRef = useRef<number>(0);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const currentRotationRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const getCenter = () => {
      const rect = section.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    const handleStart = (clientX: number, clientY: number) => {
      setIsMouseDown(true);
      lastMousePosRef.current = { x: clientX, y: clientY };
      const center = getCenter();
      const angle = Math.atan2(clientY - center.y, clientX - center.x);
      currentRotationRef.current = (angle * 180 / Math.PI) - rotationOffset;
    };

    const handleEnd = () => {
      setIsMouseDown(false);
      lastMousePosRef.current = null;
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isMouseDown) return;
      const center = getCenter();
      const angle = Math.atan2(clientY - center.y, clientX - center.x);
      const angleDeg = angle * 180 / Math.PI;

      if (lastMousePosRef.current !== null) {
        const prevAngle = Math.atan2(
          lastMousePosRef.current.y - center.y,
          lastMousePosRef.current.x - center.x
        );
        const prevAngleDeg = prevAngle * 180 / Math.PI;
        let deltaAngle = angleDeg - prevAngleDeg;
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        velocityRef.current += deltaAngle * 0.07;
      }

      lastMousePosRef.current = { x: clientX, y: clientY };
    };

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      handleStart(e.clientX, e.clientY);
      e.preventDefault();
    };
    const handleMouseUp = () => handleEnd();
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleMouseLeave = () => handleEnd();

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handleStart(touch.clientX, touch.clientY);
      }
    };
    const handleTouchEnd = () => handleEnd();
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
        e.preventDefault(); // Prevent scrolling while spinning the vinyl
      }
    };

    // Smooth animation loop
    const animate = () => {
      currentRotationRef.current += velocityRef.current;
      velocityRef.current *= 0.9;
      if (Math.abs(velocityRef.current) < 0.01) {
        velocityRef.current = 0;
      }
      setRotationOffset(currentRotationRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    section.addEventListener("mousedown", handleMouseDown);
    section.addEventListener("mouseup", handleMouseUp);
    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);
    section.addEventListener("touchstart", handleTouchStart, { passive: true });
    section.addEventListener("touchend", handleTouchEnd);
    section.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp);

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      section.removeEventListener("mousedown", handleMouseDown);
      section.removeEventListener("mouseup", handleMouseUp);
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
      section.removeEventListener("touchstart", handleTouchStart);
      section.removeEventListener("touchend", handleTouchEnd);
      section.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMouseDown, rotationOffset]);

  // Glow intensity increases slightly with movement
  const glowIntensity = 1 + Math.abs(velocityRef.current) * 0.005;

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-background"
      style={{ cursor: isMouseDown ? "grabbing" : "grab", touchAction: "none" }}
    >
      {/* === STARBURST RAYS — radiating from center === */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="starburst-container animate-spin-slow">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="starburst-ray"
              style={{
                transform: `rotate(${i * 15}deg)`,
                opacity: i % 2 === 0 ? 0.06 : 0.03,
              }}
            />
          ))}
        </div>
      </div>

      {/* === CONCENTRIC VINYL RINGS — the geometric heart === */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outermost ring — slow counter-rotation + scratch effect */}
        <div
          className="vinyl-ring vinyl-ring-outer"
          style={{
            transform: `translate(-50%, -50%) rotate(${-rotationOffset * 0.8}deg)`,
            willChange: "transform",
          }}
        >
          <div className="vinyl-ring-dashes ring-dashes-32" />
        </div>

        {/* Second ring — dotted pattern + scratch effect */}
        <div
          className="vinyl-ring vinyl-ring-mid"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotationOffset * 0.6}deg)`,
            willChange: "transform",
          }}
        >
          <div className="vinyl-ring-dots" />
        </div>

        {/* Third ring — solid grooves + scratch effect */}
        <div
          className="vinyl-ring vinyl-ring-inner"
          style={{
            transform: `translate(-50%, -50%) rotate(${-rotationOffset}deg)`,
            willChange: "transform",
          }}
        >
          <div className="vinyl-ring-grooves" />
        </div>

        {/* Center disc — the label */}
        <div
          className="vinyl-center-disc animate-spin-slow-2"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotationOffset * 0.3}deg)`,
            willChange: "transform",
          }}
        >
          <div className="vinyl-center-hole" />
        </div>
      </div>

      {/* === FLOATING GEOMETRIC ACCENTS === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Diamond shapes scattered */}
        <div className="geo-diamond geo-diamond-1 animate-drift-1" />
        <div className="geo-diamond geo-diamond-2 animate-drift-2" />
        <div className="geo-diamond geo-diamond-3 animate-drift-3" />

        {/* Small circles */}
        <div className="geo-circle geo-circle-1 animate-drift-4" />
        <div className="geo-circle geo-circle-2 animate-drift-5" />
      </div>

      {/* === AMBIENT GLOW LAYERS === */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(700px,90vw)] h-[min(700px,90vw)] rounded-full bg-[radial-gradient(circle,rgba(232,121,26,0.18)_0%,rgba(212,104,15,0.08)_30%,rgba(232,121,26,0.03)_55%,transparent_70%)] animate-glow-breathe pointer-events-none"
        style={{
          opacity: Math.min(1, glowIntensity * 0.6),
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(500px,70vw)] h-[min(500px,70vw)] rounded-full bg-[radial-gradient(circle,rgba(244,162,54,0.12)_0%,transparent_60%)] animate-glow-breathe-delayed pointer-events-none"
        style={{
          opacity: Math.min(0.8, glowIntensity * 0.4),
        }}
      />

      {/* Edge vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(26_14_8)_85%)] pointer-events-none" />

      {/* === HERO CONTENT — layered over the vortex === */}
      <Hero />
    </section>
  );
}
