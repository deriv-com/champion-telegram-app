import PropTypes from 'prop-types';
import { useTheme } from '@/contexts/ThemeContext';
import { useTelegram } from '@/hooks/useTelegram';
import styles from './ThemeToggle.module.css';

const ThemeToggle = ({ 
  className = '',
  size = 'md',
  disabled,
  ...props 
}) => {
  const { theme, setTheme } = useTheme();
  const { haptic } = useTelegram();

  const handleToggle = () => {
    if (!disabled) {
      haptic.impact();
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  const sizeClass = size !== 'md' ? styles[size] : '';
  const combinedClasses = [styles.toggle, sizeClass, className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={combinedClasses}
      onClick={handleToggle}
      disabled={disabled}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      {...props}
    >
      <div className={styles.track}>
        <div className={styles.thumb}>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {theme === 'light' ? (
              // Sun icon
              <>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </>
            ) : (
              // Moon icon
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            )}
          </svg>
        </div>
      </div>
    </button>
  );
};

ThemeToggle.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool
};

export default ThemeToggle;
