import PropTypes from 'prop-types';
import { championTradeLogo } from '@/assets';
import styles from './Hero.module.css';

const Button = ({ variant = 'primary', children, ...props }) => (
  <button 
    className={variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary}
    {...props}
  >
    {children}
  </button>
);

const Hero = () => {
  return (
    <section className={styles.hero} role="banner">
      <div className={styles.container}>
        <img 
          src={championTradeLogo} 
          alt="Champion Trade" 
          className={styles.logo}
          width="380"
          height="auto"
        />
        
        <div className={styles.content}>
          <h1 className={styles.title}>
            Trade Smarter with Champion Trade
          </h1>
          <p className={styles.subtitle}>
            Experience the future of trading with our advanced platform, powerful tools, and expert insights
          </p>
        </div>

        <div className={styles.buttons}>
          <Button aria-label="Create new account">Open Account</Button>
          <Button variant="secondary" aria-label="Access your account">Login</Button>
        </div>
      </div>
    </section>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary']),
  children: PropTypes.node.isRequired
};

export default Hero;
