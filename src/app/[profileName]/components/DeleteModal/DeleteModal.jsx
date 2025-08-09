import { FaExclamationTriangle } from "react-icons/fa";

import styles from "./styles.module.scss";
export const DeleteModal = ({ title, onCancel, onConfirm }) => {
  return (
    <div className={styles.modal}>
      <FaExclamationTriangle />
      <h3>Delete Article</h3>
      <p className={styles.articleName}>{title}</p>
      <p>Will be deleted, deletion is not reversible</p>
      <div className={styles.buttonContainer}>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={styles.delButton}>
          Delete
        </button>
      </div>
    </div>
  );
};
