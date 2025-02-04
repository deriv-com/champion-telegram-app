import PropTypes from 'prop-types';
import { useTelegram } from '@/hooks/useTelegram';
import styles from './Button.module.css';

const Button = ({
  variant = 'primary', 
  children, 
  className,
  loading,
  ...props
}) => {
  const { haptic } = useTelegram();
  
  const handleClick = (e) => {
    haptic.impact();
    props.onClick?.(e);
  };

  const variantClass = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  const loadingClass = loading ? styles.loading : '';
  const combinedClasses = [variantClass, loadingClass, className].filter(Boolean).join(' ');

  return (
    <button 
      className={combinedClasses}
      disabled={loading || props.disabled}
      {...props}
      onClick={handleClick}
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
