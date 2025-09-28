import React from 'react';

const MagicCard = ({
  children,
  className = '',
  hoverEffect = true,
  glowIntensity = 'medium',
  gradientFrom = 'rgb(34, 197, 94)', // Green
  gradientTo = 'rgb(16, 185, 129)', // Emerald
  borderColor = 'rgba(34, 197, 94, 0.3)',
  onClick,
  style = {},
  ...props
}) => {
  const getGlowIntensityValue = () => {
    switch (glowIntensity) {
      case 'low': return 0.4;
      case 'medium': return 0.6;
      case 'high': return 0.8;
      case 'intense': return 1.0;
      default: return 0.6;
    }
  };

  const cardStyles = {
    '--glow-x': '50%',
    '--glow-y': '50%',
    '--glow-intensity': '0',
    '--gradient-from': gradientFrom,
    '--gradient-to': gradientTo,
    '--border-color': borderColor,
    '--max-glow': getGlowIntensityValue(),
    ...style
  };

  return (
    <div
      className={`
        magic-card relative overflow-hidden
        bg-gradient-to-br from-white/10 to-white/5
        backdrop-blur-md
        border border-gray-200/20
        rounded-xl
        transition-all duration-300 ease-out
        cursor-pointer
        group
        ${hoverEffect ? 'hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1' : ''}
        ${className}
      `}
      style={cardStyles}
      onClick={onClick}
      {...props}
    >
      {/* Background Glow Effect */}
      <div 
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), 
            rgba(34, 197, 94, calc(var(--glow-intensity, 0) * var(--max-glow, 0.6))) 0%, 
            rgba(34, 197, 94, calc(var(--glow-intensity, 0) * var(--max-glow, 0.6) * 0.5)) 20%, 
            transparent 60%)`,
          opacity: 'var(--glow-intensity, 0)'
        }}
      />
      
      {/* Border Glow Effect */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, 
            rgba(34, 197, 94, calc(var(--glow-intensity, 0) * 0.3)) 0%, 
            transparent 50%, 
            rgba(16, 185, 129, calc(var(--glow-intensity, 0) * 0.2)) 100%)`,
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'exclude',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude'
        }}
      />
      
      {/* Inner Shadow for Depth */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
      
      {/* Shine Effect on Hover */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
          transform: 'translateX(-100%)',
          animation: hoverEffect ? 'shine 2s infinite' : 'none'
        }}
      />
      
      {/* CSS for shine animation */}
      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default MagicCard;