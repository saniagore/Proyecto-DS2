import React from 'react';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animateEnter?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

export const Card: React.FC<CardProps> = ({
  animateEnter = false,
  padding = 'md',
  as: Component = 'div',
  className = '',
  children,
  ...props
}) => {
  const classes = [
    'rumbo-card',
    `rumbo-card--p-${padding}`,
    animateEnter ? 'animate-enter' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};
