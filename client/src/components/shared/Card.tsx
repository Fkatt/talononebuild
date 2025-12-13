// Shared Card Component

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
