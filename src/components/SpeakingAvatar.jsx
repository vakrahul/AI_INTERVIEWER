import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

const SpeakingAvatar = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const { currentInterview } = useSelector((state) => state.interview);
  const isAiSpeaking = currentInterview?.isAiSpeaking || false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Animation parameters
    let mouthOpenness = 0;
    let targetMouthOpenness = 0;
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkProgress = 0;
    let jawOffset = 0;
    let targetJawOffset = 0;

    // Draw realistic robot avatar
    const drawAvatar = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Background glow
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 150);
      bgGradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      bgGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Robot head - metallic gradient
      const headGradient = ctx.createLinearGradient(centerX - 90, 0, centerX + 90, height);
      headGradient.addColorStop(0, '#4a5568');
      headGradient.addColorStop(0.5, '#2d3748');
      headGradient.addColorStop(1, '#1a202c');
      
      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.roundRect(centerX - 90, centerY - 100, 180, 200, 20);
      ctx.fill();

      // Head highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.ellipse(centerX - 30, centerY - 60, 40, 60, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Antenna
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 100);
      ctx.lineTo(centerX, centerY - 130);
      ctx.stroke();

      // Antenna light
      const antennaGlow = ctx.createRadialGradient(centerX, centerY - 130, 2, centerX, centerY - 130, 10);
      antennaGlow.addColorStop(0, isAiSpeaking ? '#3b82f6' : '#6b7280');
      antennaGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = antennaGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 130, 10, 0, Math.PI * 2);
      ctx.fill();

      // Eyes - LED style
      const eyeY = centerY - 30;
      const eyeWidth = 35;
      const eyeHeight = isBlinking ? 2 : 20;
      const eyeColor = isAiSpeaking ? '#3b82f6' : '#60a5fa';

      // Left eye
      const leftEyeGradient = ctx.createRadialGradient(centerX - 35, eyeY, 0, centerX - 35, eyeY, 20);
      leftEyeGradient.addColorStop(0, eyeColor);
      leftEyeGradient.addColorStop(0.7, eyeColor);
      leftEyeGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = leftEyeGradient;
      ctx.beginPath();
      ctx.roundRect(centerX - 52, eyeY - eyeHeight/2, eyeWidth, eyeHeight, 5);
      ctx.fill();

      // Right eye
      const rightEyeGradient = ctx.createRadialGradient(centerX + 35, eyeY, 0, centerX + 35, eyeY, 20);
      rightEyeGradient.addColorStop(0, eyeColor);
      rightEyeGradient.addColorStop(0.7, eyeColor);
      rightEyeGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = rightEyeGradient;
      ctx.beginPath();
      ctx.roundRect(centerX + 17, eyeY - eyeHeight/2, eyeWidth, eyeHeight, 5);
      ctx.fill();

      // Eye reflections
      if (!isBlinking) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(centerX - 40, eyeY - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 30, eyeY - 5, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth area - speaker grille style with jaw movement
      const mouthY = centerY + 40 + jawOffset;
      const mouthBaseWidth = 80;
      const mouthBaseHeight = 30;

      // Mouth frame
      ctx.fillStyle = '#1a202c';
      ctx.beginPath();
      ctx.roundRect(
        centerX - mouthBaseWidth/2 - 5,
        mouthY - mouthBaseHeight/2 - 5,
        mouthBaseWidth + 10,
        mouthBaseHeight + 10,
        10
      );
      ctx.fill();

      // Speaking animation - audio bars
      const barCount = 7;
      const barWidth = 8;
      const barSpacing = 3;
      const totalWidth = (barWidth + barSpacing) * barCount - barSpacing;
      const startX = centerX - totalWidth / 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + barSpacing);
        let barHeight;
        
        if (isAiSpeaking) {
          // Dynamic bar heights based on speaking
          const heightVariation = Math.sin((Date.now() / 100) + i) * 0.5 + 0.5;
          barHeight = (mouthBaseHeight - 10) * (0.3 + heightVariation * 0.7 * mouthOpenness);
        } else {
          // Idle state - minimal height
          barHeight = 4;
        }

        // Bar gradient
        const barGradient = ctx.createLinearGradient(x, mouthY - barHeight/2, x, mouthY + barHeight/2);
        barGradient.addColorStop(0, isAiSpeaking ? '#3b82f6' : '#4b5563');
        barGradient.addColorStop(0.5, isAiSpeaking ? '#60a5fa' : '#6b7280');
        barGradient.addColorStop(1, isAiSpeaking ? '#3b82f6' : '#4b5563');
        
        ctx.fillStyle = barGradient;
        ctx.beginPath();
        ctx.roundRect(x, mouthY - barHeight/2, barWidth, barHeight, 2);
        ctx.fill();

        // Bar glow when speaking
        if (isAiSpeaking && mouthOpenness > 0.3) {
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 10;
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
          ctx.beginPath();
          ctx.roundRect(x, mouthY - barHeight/2, barWidth, barHeight, 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Sound wave rings when speaking
      if (isAiSpeaking && mouthOpenness > 0.2) {
        const waveCount = 3;
        const time = Date.now() / 1000;
        
        for (let i = 0; i < waveCount; i++) {
          const progress = (time * 2 + i * 0.3) % 1;
          const radius = 120 + progress * 50;
          const alpha = (1 - progress) * mouthOpenness * 0.3;
          
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Neck connector
      ctx.fillStyle = '#2d3748';
      ctx.beginPath();
      ctx.rect(centerX - 30, centerY + 100, 60, 20);
      ctx.fill();

      // Status indicator light
      const statusColor = isAiSpeaking ? '#10b981' : '#6b7280';
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(centerX + 70, centerY - 80, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Status light glow
      if (isAiSpeaking) {
        ctx.shadowColor = statusColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = statusColor;
        ctx.beginPath();
        ctx.arc(centerX + 70, centerY - 80, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    // Animation loop
    const animate = () => {
      if (isAiSpeaking) {
        // Realistic speech patterns
        const time = Date.now() / 100;
        const random = Math.random();
        
        if (random > 0.8) {
          targetMouthOpenness = 0.8 + Math.random() * 0.2;
          targetJawOffset = 3;
        } else if (random > 0.5) {
          targetMouthOpenness = 0.4 + Math.random() * 0.3;
          targetJawOffset = 2;
        } else if (random > 0.2) {
          targetMouthOpenness = 0.2 + Math.random() * 0.2;
          targetJawOffset = 1;
        } else {
          targetMouthOpenness = 0.05;
          targetJawOffset = 0;
        }
        
        setIsSpeaking(true);
      } else {
        targetMouthOpenness = 0;
        targetJawOffset = 0;
        setIsSpeaking(false);
      }

      // Smooth transitions
      mouthOpenness += (targetMouthOpenness - mouthOpenness) * 0.3;
      jawOffset += (targetJawOffset - jawOffset) * 0.2;

      // Blinking
      blinkTimer++;
      if (blinkTimer > 150 && !isBlinking) {
        isBlinking = true;
        blinkProgress = 0;
        blinkTimer = 0;
      }

      if (isBlinking) {
        blinkProgress += 0.2;
        if (blinkProgress >= 1) {
          isBlinking = false;
          blinkProgress = 0;
        }
      }

      drawAvatar();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAiSpeaking]);

  return (
    <div style={{ 
      position: 'relative',
      display: 'inline-block'
    }}>
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={300}
        style={{
          filter: isSpeaking 
            ? 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.6))' 
            : 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))',
          transition: 'filter 0.3s ease'
        }}
      />
    </div>
  );
};

export default SpeakingAvatar;