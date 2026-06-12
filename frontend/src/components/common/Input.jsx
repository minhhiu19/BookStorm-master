import React from 'react';
import styles from './Input.module.css';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  icon: Icon,
  name,
  required,
  disabled,
  className = '',
  rows,
  ...rest
}) => {
  const isTextarea = type === 'textarea';
  const Tag = isTextarea ? 'textarea' : 'input';

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label}
          {required && <span style={{ color: 'var(--color-accent)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div className={styles.inputContainer}>
        {Icon && (
          <span className={styles.icon}>
            <Icon />
          </span>
        )}
        <Tag
          id={name}
          name={name}
          type={isTextarea ? undefined : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={isTextarea ? rows || 4 : undefined}
          className={`${styles.input} ${Icon ? styles.inputWithIcon : ''} ${error ? styles.inputError : ''} ${isTextarea ? styles.textarea : ''}`}
          {...rest}
        />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Input;
