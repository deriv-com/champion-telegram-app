import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({ variant = 'primary', children, ...props }) => (
  <button 
    className={variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary}
    {...props}
  >
    {children}
  </button>
);

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary']),
  children: PropTypes.node.isRequired
};

export default Button;
