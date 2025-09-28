import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const MagicBento = ({
  children,
  className = '',
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = "34, 197, 94", // Green color instead of purple
}) => {
  const containerRef = useRef(null);
  const spotlightRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cards = container.querySelectorAll('.magic-card');

    // Create global spotlight
    if (enableSpotlight && !spotlightRef.current) {
      const spotlight = document.createElement('div');
      spotlight.className = 'global-spotlight';
      spotlight.style.cssText = `
        position: fixed;
        width: ${spotlightRadius}px;
        height: ${spotlightRadius}px;
        background: radial-gradient(circle, rgba(${glowColor}, 0.3) 0%, rgba(${glowColor}, 0.1) 30%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 200;
        mix-blend-mode: screen;
        opacity: 0;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(spotlight);
      spotlightRef.current = spotlight;
    }

    // Mouse move handler for spotlight and card effects
    const handleMouseMove = (e) => {
      if (enableSpotlight && spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          duration: 0.3,
          x: e.clientX,
          y: e.clientY,
          ease: "power2.out"
        });
      }

      // Update glow position for all cards
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        card.style.setProperty('--glow-x', `${x}%`);
        card.style.setProperty('--glow-y', `${y}%`);
      });
    };

    // Card hover effects
    const handleCardEnter = (e) => {
      const card = e.currentTarget;
      
      if (enableSpotlight && spotlightRef.current) {
        gsap.to(spotlightRef.current, { opacity: 1, duration: 0.3 });
      }
      
      if (enableBorderGlow) {
        card.style.setProperty('--glow-intensity', '1');
      }
      
      if (enableTilt) {
        gsap.to(card, {
          rotationX: 5,
          rotationY: 5,
          transformPerspective: 1000,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    const handleCardLeave = (e) => {
      const card = e.currentTarget;
      
      if (enableSpotlight && spotlightRef.current) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3 });
      }
      
      if (enableBorderGlow) {
        card.style.setProperty('--glow-intensity', '0');
      }
      
      if (enableTilt) {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    // Click effect
    const handleCardClick = (e) => {
      if (!clickEffect) return;
      
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create ripple effect
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        background: rgba(${glowColor}, 0.3);
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 10;
      `;
      
      card.appendChild(ripple);
      
      gsap.to(ripple, {
        width: 300,
        height: 300,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => ripple.remove()
      });
    };

    // Create particles for cards if enabled
    if (enableStars) {
      cards.forEach(card => {
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'magic-particle';
          particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(${glowColor}, 0.6);
            border-radius: 50%;
            opacity: 0;
            pointer-events: none;
          `;
          
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          
          particle.style.left = `${x}%`;
          particle.style.top = `${y}%`;
          
          card.appendChild(particle);
          particlesRef.current.push(particle);
          
          // Animate particles
          gsap.to(particle, {
            opacity: Math.random() * 0.5 + 0.2,
            scale: Math.random() * 0.5 + 0.5,
            duration: 2,
            repeat: -1,
            yoyo: true,
            delay: Math.random() * 2,
            ease: "sine.inOut"
          });
        }
      });
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', handleCardEnter);
      card.addEventListener('mouseleave', handleCardLeave);
      card.addEventListener('click', handleCardClick);
    });

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      
      cards.forEach(card => {
        card.removeEventListener('mouseenter', handleCardEnter);
        card.removeEventListener('mouseleave', handleCardLeave);
        card.removeEventListener('click', handleCardClick);
      });
      
      if (spotlightRef.current) {
        document.body.removeChild(spotlightRef.current);
        spotlightRef.current = null;
      }
      
      particlesRef.current.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      particlesRef.current = [];
    };
  }, [enableStars, enableSpotlight, enableBorderGlow, enableTilt, enableMagnetism, clickEffect, spotlightRadius, particleCount, glowColor]);

  return (
    <div 
      ref={containerRef}
      className={`magic-bento ${className}`}
      data-text-autohide={textAutoHide}
    >
      {children}
    </div>
  );
};

export default MagicBento;