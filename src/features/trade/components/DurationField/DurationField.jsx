import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import BottomSheet from '@/shared/components/BottomSheet';
import { chevronDownIcon } from '@/assets/images';
import DurationSelector from './DurationSelector/DurationSelector';
import styles from './DurationField.module.css';

const DurationField = ({ value, onChange }) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(false);

  const handleDurationSelect = useCallback((selectedDuration) => {
    onChange(selectedDuration);
    setIsBottomSheetOpen(false);
  }, [onChange]);

  return (
    <div className={`card-view ${styles.container}`}>
      <div 
        className={styles.fieldContent}
        onClick={() => setIsBottomSheetOpen(true)}
      >
        <div className={styles.textContent}>
          <span className={`card-view-label ${styles.label}`}>Duration</span>
          <span className={`card-view-value ${styles.value}`}>
            {value} tick{value !== 1 ? 's' : ''}
          </span>
        </div>
        <img src={chevronDownIcon} alt="select" className={styles.chevron} />
      </div>

      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="Select Duration"
      >
        <DurationSelector
          value={value}
          onSubmit={handleDurationSelect}
        />
      </BottomSheet>
    </div>
  );
};

DurationField.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default React.memo(DurationField);
