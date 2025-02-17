import React from 'react';
import { championTradeLogo, tradingChartIllustration, telegramIcon, chevronRight } from '@/assets/images';
import { Carousel, Button } from '@/shared';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';
import { ROUTES } from '@/config/routes.config';
import styles from './LandingPageNew.module.css';

const slides = [
  {
    title: 'Trade Smarter with Champion Trade',
    subtitle: 'Experience the future of trading with our advanced platform powerful tools and expert insights',
    banner: tradingChartIllustration
  },
  {
    title: 'Trade Smarter with Champion Trade',
    subtitle: 'Experience the future of trading with our advanced platform powerful tools and expert insights',
    banner: tradingChartIllustration
  },
  {
    title: 'Trade Smarter with Champion Trade',
    subtitle: 'Experience the future of trading with our advanced platform powerful tools and expert insights',
    banner: tradingChartIllustration
  }
];

const LandingPageNew = () => {
  const navigate = useNavigate();
  const { handleTelegramLogin } = useTelegram();

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

        <div className={styles.buttonContainer}>
          <Button
            onClick={handleTelegramLogin}
            aria-label="Quick login with Telegram"
            disabled={false}
            fullWidth={false}
          >
            <img src={telegramIcon} alt="" className={styles.buttonIcon} />
            <span>Quick login with Telegram</span>
          </Button>
        </div>

        <div className={styles.accountSection}>
          <p className={styles.accountText}>Already have an account?</p>
          <a
            href="#"
            className={styles.accountLink}
            onClick={(e) => {
              e.preventDefault();
              navigate(ROUTES.LOGIN);
            }}
          >
            <span className={styles.linkLabel}>Login with existing account</span>
            <img src={chevronRight} alt="" className={styles.linkIcon} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default LandingPageNew;
