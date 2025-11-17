import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  accentBorder?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, title, accentBorder = false }) => {
  return (
    <div className={`bg-base-100 rounded-lg shadow-card border border-base-300/50 ${accentBorder ? 'border-t-4 border-t-primary' : ''} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-base-300">
          <h3 className="text-lg font-semibold text-neutral font-serif">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;