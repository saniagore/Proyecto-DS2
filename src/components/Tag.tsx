import React from 'react';
import './Tag.css';

export type TagVariant = 'default' | 'proximo' | 'progreso' | 'finalizado' | 'accent';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  dot?: boolean;
}

export const Tag: React.FC<TagProps> = ({
  variant = 'default',
  dot = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <span className={`rumbo-tag rumbo-tag--${variant} ${className}`} {...props}>
      {dot && <span className="rumbo-tag__dot" aria-hidden="true" />}
      {children}
    </span>
  );
};
