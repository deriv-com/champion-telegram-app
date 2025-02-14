import React from 'react';
import { championTradeLogo, tradingChartIllustration } from '@/assets/images';
import { Button, Carousel } from '@/shared';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import styles from './LandingPageNew.module.css';

const slides = [
  {
    title: 'Trade Smarter with Champion Trade',
    subtitle: 'Experience the future of trading with our advanced platform powerful tools and expert insights',
    banner: tradingChartIllustration
  },
  {
    title: 'Placeholder Title 2',
    subtitle: 'Placeholder subtitle for the second slide with similar length for consistency',
    banner: tradingChartIllustration
  },
  {
    title: 'Placeholder Title 3',
    subtitle: 'Placeholder subtitle for the third slide maintaining the visual balance',
    banner: tradingChartIllustration
  }
];

const LandingPageNew = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.hero} role="banner">
      <div className={styles.container}>
        <img
          src={championTradeLogo}
          alt="Champion Trade"
          className={styles.logo}
          width="280"
          height="auto"
        />

        <Carousel
          slides={slides}
          autoRotate={true}
          autoRotateInterval={5000}
          className={styles.carousel}
          width="100%"
          margin="var(--spacing-md) 0"
        />

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

export default LandingPageNew;
