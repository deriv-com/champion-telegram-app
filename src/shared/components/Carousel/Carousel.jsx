import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Carousel.module.css';

const renderDefaultSlide = (slide, { bannerWidth = '390px', bannerHeight = 'auto' }) => (
  <div className={styles.slideContent}>
    {slide.banner && (
      <div className={styles.bannerWrapper}>
        <img 
          src={slide.banner}
          alt="Slide Banner"
          className={styles.banner}
          width={bannerWidth}
          height={bannerHeight}
        />
      </div>
    )}
    {slide.title && <h2 className={styles.title}>{slide.title}</h2>}
    {slide.subtitle && <p className={styles.subtitle}>{slide.subtitle}</p>}
  </div>
);

const Carousel = ({
  slides,
  renderSlide = renderDefaultSlide,
  autoRotate = true,
  autoRotateInterval = 5000,
  className = '',
  indicators = true,
  swipeEnabled = true,
  height,
  width,
  margin,
  padding,
  bannerWidth,
  bannerHeight,
}) => {
  const carouselStyle = {
    height,
    width,
    margin,
    padding
  };

  // Filter out undefined values
  Object.keys(carouselStyle).forEach(key => 
    carouselStyle[key] === undefined && delete carouselStyle[key]
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!autoRotate) return;

    const timer = setInterval(nextSlide, autoRotateInterval);
    return () => clearInterval(timer);
  }, [nextSlide, autoRotate, autoRotateInterval]);

  const handleTouchStart = (e) => {
    if (!swipeEnabled) return;
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!swipeEnabled) return;
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!swipeEnabled || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  return (
      <div 
        className={`${styles.carousel} ${className}`}
        style={carouselStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex="0"
        role="region"
        aria-label="Carousel"
      >
      <div 
        className={styles.slides}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${slides.length}`}
          >
            {renderSlide(slide, { bannerWidth, bannerHeight }, index)}
          </div>
        ))}
      </div>

      {indicators && (
        <div className={styles.indicators} role="tablist">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentSlide}
              role="tab"
            />
          ))}
        </div>
      )}
    </div>
  );
};

Carousel.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      banner: function(props, propName, componentName) {
        if (!props.banner && !props.title) {
          return new Error(
            `Either 'banner' or 'title' is required in ${componentName}`
          );
        }
      },
      title: function(props, propName, componentName) {
        if (!props.banner && !props.title) {
          return new Error(
            `Either 'banner' or 'title' is required in ${componentName}`
          );
        }
      },
      subtitle: PropTypes.string
    })
  ).isRequired,
  renderSlide: PropTypes.func,
  autoRotate: PropTypes.bool,
  autoRotateInterval: PropTypes.number,
  className: PropTypes.string,
  indicators: PropTypes.bool,
  swipeEnabled: PropTypes.bool,
  height: PropTypes.string,
  width: PropTypes.string,
  margin: PropTypes.string,
  padding: PropTypes.string,
  bannerWidth: PropTypes.string,
  bannerHeight: PropTypes.string,
};

export default Carousel;
