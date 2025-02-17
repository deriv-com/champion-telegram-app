import React from 'react';
import { championTradeLogo, tradingChartIllustration, secureTradingIllustration, startTradingIllustration, telegramIcon, chevronRight } from '@/assets/images';
import { Carousel, Button } from '@/shared';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';
import { ROUTES } from '@/config/routes.config';
import styles from './LandingPage.module.css';

const slides = [
  {
    title: 'Trade Smarter with Champion Trade',
    subtitle: 'Experience the future of trading with our advanced platform, powerful tools, and expert insights',
    banner: tradingChartIllustration
  },
  {
    title: 'Secure and Reliable Trading',
    subtitle: 'Trade with confidence using our state-of-the-art security features and stable platform',
    banner: secureTradingIllustration
  },
  {
    title: 'Start Trading Today',
    subtitle: 'Join thousands of traders and begin your journey to financial success',
    banner: startTradingIllustration
  }
];

const LandingPage = React.memo(function LandingPage() {
  const navigate = useNavigate();
  const { handleTelegramLogin } = useTelegram();

  return (
    <section className={styles.hero} role="banner">
      <div className={styles.container}>
        <img
          src={championTradeLogo}
          alt="Champion Trade Logo"
          className={styles.logo}
          width="267"
          height="60"
          loading="eager"
          priority="high"
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
            disabled={true}
            fullWidth={false}
            className={styles.telegramButton}
          >
            <img
              src={telegramIcon}
              alt=""
              className={styles.buttonIcon}
              width="16"
              height="16"
              aria-hidden="true"
            />
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
            <img
              src={chevronRight}
              alt=""
              className={styles.linkIcon}
              width="15"
              height="24"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
});

export default LandingPage;
