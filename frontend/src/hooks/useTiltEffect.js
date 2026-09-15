import { useEffect } from 'react';

export function useTiltEffect() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      // Background shift
      document.body.style.backgroundPosition = `${x * 40}px ${y * 40}px`;

      // Hero Shapes Parallax (if they exist)
      document.querySelectorAll('.shape').forEach((shape) => {
        const speed = shape.getAttribute('data-speed') || 2;
        const xOffset = ((window.innerWidth / 2 - e.clientX) * speed) / 50;
        const yOffset = ((window.innerHeight / 2 - e.clientY) * speed) / 50;
        shape.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });

      // Tilt Cards
      document.querySelectorAll('.tilt-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;
        if (cardX > 0 && cardX < rect.width && cardY > 0 && cardY < rect.height) {
          const xRot = (cardY / rect.height - 0.5) * -10;
          const yRot = (cardX / rect.width - 0.5) * 10;
          card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) translateZ(10px)`;
        } else {
          card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateZ(0)`;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
}
