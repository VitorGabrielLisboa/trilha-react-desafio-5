import styles from "./styles.module.scss";
export const Overlay = ({ triggers = [], onClick }) => {
  const shouldShow = triggers.some((t) => t.isOpen);

  return shouldShow ? (
    <div
      onClick={() => {
        triggers.forEach((t) => t.onClose());
        onClick?.();
      }}
      className={styles.grayBackground}
    />
  ) : null;
};
