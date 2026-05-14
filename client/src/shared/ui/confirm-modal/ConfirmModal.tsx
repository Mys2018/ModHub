import styles from './ConfirmModal.module.css'
import { useConfirmStore } from "../model/useConfirmStore.ts";

export const ConfirmModal = () => {
  const { isOpen, title, message, onConfirm, closeConfirm, cancelButtonText, agreeButtonText } = useConfirmStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    closeConfirm();
  };

  return (
    <div className={styles.overlay} onClick={closeConfirm}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <div className={styles.buttonGroup}>
          <button className={`${styles.button} ${styles.cancelButton}`} onClick={closeConfirm}>
            {cancelButtonText}
          </button>
          <button className={`${styles.button} ${styles.deleteButton}`} onClick={handleConfirm}>
            {agreeButtonText}
          </button>
        </div>
      </div>
    </div>
  )
}