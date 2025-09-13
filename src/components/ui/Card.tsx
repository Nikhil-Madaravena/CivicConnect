import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  padding = 'md' 
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-md border border-gray-200 transition-shadow duration-200 hover:shadow-lg',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};