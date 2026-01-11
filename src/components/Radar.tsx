import { useEffect, useRef, useState } from 'react';
import './Radar.css';

interface Ping {
  id: number;
  angle: number;
  distance: number;
  intensity: number;
  age: number;
  maxAge: number;
}

const Radar = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pingsRef = useRef<Ping[]>([]);
  const [pingCount, setPingCount] = useState(0);
  const lastPingTimeRef = useRef<number>(0);
  const frameTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let angle = 0;
    const rotationSpeed = 0.01;

    // Generate new ping randomly
    const generateNewPing = (): Ping => {
      return {
        id: Date.now() + Math.random(),
        angle: Math.random() * Math.PI * 2,
        distance: 0.3 + Math.random() * 0.5, // Between 30% and 80% of radius
        intensity: 0.5 + Math.random() * 0.5,
        age: 0,
        maxAge: 3000 + Math.random() * 2000, // 3-5 seconds
      };
    };

    const draw = (currentTime: number) => {
      const deltaTime = currentTime - frameTimeRef.current;
      frameTimeRef.current = currentTime;
      
      // Generate new pings occasionally
      if (currentTime - lastPingTimeRef.current > 2000 + Math.random() * 3000) {
        const newPing = generateNewPing();
        pingsRef.current = [...pingsRef.current, newPing];
        setPingCount(pingsRef.current.length);
        lastPingTimeRef.current = currentTime;
      }

      // Update and filter pings
      pingsRef.current = pingsRef.current
        .map((ping) => ({
          ...ping,
          age: ping.age + deltaTime,
        }))
        .filter((ping) => ping.age < ping.maxAge);
      
      setPingCount(pingsRef.current.length);

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw concentric circles
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const rad = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(rad) * radius,
          centerY + Math.sin(rad) * radius
        );
        ctx.stroke();
      }

      // Draw rotating sweep line
      ctx.strokeStyle = '#00ff64';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.stroke();

      // Draw gradient sweep
      const gradient = ctx.createLinearGradient(
        centerX,
        centerY,
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      gradient.addColorStop(0, 'rgba(0, 255, 100, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle - 0.3, angle);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Draw all pings
      pingsRef.current.forEach((ping) => {
        const pingX = centerX + Math.cos(ping.angle) * ping.distance * radius;
        const pingY = centerY + Math.sin(ping.angle) * ping.distance * radius;
        
        // Fade out as ping ages
        const ageRatio = ping.age / ping.maxAge;
        const opacity = (1 - ageRatio) * ping.intensity;
        
        // Check if sweep line is near this ping (detection effect)
        const angleDiff = Math.abs(angle - ping.angle);
        const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
        const isDetected = normalizedAngleDiff < 0.2; // Within ~11 degrees
        
        // Draw connection line to center
        ctx.strokeStyle = `rgba(0, 255, 100, ${opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pingX, pingY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw ping with pulsing effect
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        const pingSize = isDetected ? 12 : 8;
        const pingGlow = isDetected ? 30 : 20;
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(pingX, pingY, 0, pingX, pingY, pingGlow);
        glowGradient.addColorStop(0, `rgba(0, 255, 100, ${opacity * 0.6 * pulse})`);
        glowGradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(pingX, pingY, pingGlow, 0, Math.PI * 2);
        ctx.fill();

        // Ping dot
        ctx.fillStyle = `rgba(0, 255, 100, ${opacity * pulse})`;
        ctx.beginPath();
        ctx.arc(pingX, pingY, pingSize, 0, Math.PI * 2);
        ctx.fill();

        // Detection ring when sweep passes over
        if (isDetected) {
          ctx.strokeStyle = `rgba(0, 255, 100, ${opacity * 0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pingX, pingY, pingSize + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      angle += rotationSpeed;
      requestAnimationFrame(draw);
    };

    frameTimeRef.current = performance.now();
    const animationId = requestAnimationFrame((time) => draw(time));

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="radar-container">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="radar-canvas"
      />
      <div className="radar-label">Tracking {pingCount} Wallet{pingCount !== 1 ? 's' : ''}</div>
    </div>
  );
};

export default Radar;
