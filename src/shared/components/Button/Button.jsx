import PropTypes from 'prop-types';
import { useTelegram } from '@/hooks/useTelegram';
import styles from './Button.module.css';

const Button = ({
  variant = 'primary', 
  children, 
  className,
  loading,
  width,
  height,
  fullWidth = false,
  ...props
}) => {
  const { haptic } = useTelegram();
  
  const handleClick = (e) => {
    haptic.impact();
    props.onClick?.(e);
  };

  const variantClass = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  const loadingClass = loading ? styles.loading : '';
  const fullWidthClass = fullWidth ? styles.fullWidth : '';
  const combinedClasses = [variantClass, loadingClass, fullWidthClass, className].filter(Boolean).join(' ');

  const style = {
    ...(width && { width }),
    ...(height && { height }),
    ...props.style
  };

  return (
    <button 
      className={combinedClasses}
      disabled={loading || props.disabled}
      {...props}
      style={style}
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
  disabled: PropTypes.bool,
  width: PropTypes.string,
  height: PropTypes.string,
  fullWidth: PropTypes.bool,
  style: PropTypes.object
};

export default Button;
