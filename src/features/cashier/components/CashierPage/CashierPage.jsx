import React from 'react';
import {
  depositIcon,
  withdrawalIcon,
  paymentAgentsIcon,
  transferIcon,
  p2pIcon,
} from '../../../../assets/images/cashier';
import { useTelegram } from '../../../../hooks/useTelegram';
import styles from './CashierPage.module.css';

const cashierOptions = [
  { id: 'deposit', label: 'Deposit', icon: depositIcon },
  { id: 'withdrawal', label: 'Withdrawal', icon: withdrawalIcon },
  { id: 'payment-agents', label: 'Payment Agents', icon: paymentAgentsIcon },
  { id: 'transfer', label: 'Transfer', icon: transferIcon },
  { id: 'p2p', label: 'Deriv P2P', icon: p2pIcon },
];

const CashierPage = () => {
  const { tg } = useTelegram();

  const handleOptionClick = (optionId) => {
    // Show native telegram notification
    tg.showAlert('This feature is not available yet.');
    
    // Trigger haptic feedback
    tg.HapticFeedback.notificationOccurred('error');
  };

  return (
    <main className={styles.cashierView}>
      <section aria-label="Cashier Options" className={styles.optionsGrid}>
        {cashierOptions.map((option) => (
          <button
            key={option.id}
            className={styles.optionCard}
            onClick={() => handleOptionClick(option.id)}
            aria-label={`Select ${option.label}`}
          >
            <div className={styles.optionIcon}>
              <img src={option.icon} alt="" aria-hidden="true" width="24" height="24" />
            </div>
            <span className={styles.optionLabel}>{option.label}</span>
          </button>
        ))}
      </section>
    </main>
  );
};

export default CashierPage;
