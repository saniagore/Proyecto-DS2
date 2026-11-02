import React, { useId } from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id: customId,
  className = '',
  required,
  ...props
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`rumbo-field ${error ? 'rumbo-field--error' : ''} ${className}`}>
      <label htmlFor={inputId} className="rumbo-label">
        {label}
        {required && (
          <span className="rumbo-required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        id={inputId}
        className="rumbo-input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        required={required}
        {...props}
      />

      {error ? (
        <span id={errorId} role="alert" className="rumbo-error-text">
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} className="rumbo-helper-text">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
