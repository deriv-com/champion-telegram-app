import React from 'react';
import { championTradeLogo } from '@/assets/images';
import { Button } from '@/shared';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const navigate = useNavigate();

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
            Experience the future of trading with our advanced platform powerful tools and expert insights
          </p>
        </div>

        <div className={styles.buttons}>
          <Button 
            variant="secondary" 
            aria-label="Get started with Champion Trade"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
