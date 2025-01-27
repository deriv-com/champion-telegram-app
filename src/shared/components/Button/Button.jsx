import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({ 
  variant = 'primary', 
  children, 
  className,
  loading,
  ...props 
}) => {
  const variantClass = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  const loadingClass = loading ? styles.loading : '';
  const combinedClasses = [variantClass, loadingClass, className].filter(Boolean).join(' ');

  return (
    <button 
      className={combinedClasses}
      disabled={loading || props.disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool
};

export default Button;
