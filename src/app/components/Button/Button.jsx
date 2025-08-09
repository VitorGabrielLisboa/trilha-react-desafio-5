"use client";
import styles from "./styles.module.scss";

export const Button = ({ title, variant, onclick, type }) => {
  return (
    <button
      className={` ${styles.button} ${variant ? styles.variant : ""}`}
      onClick={onclick}
      type={type}
    >
      {title}
    </button>
  );
};
