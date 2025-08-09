import Link from "next/link";
import styles from "./styles.module.scss";

export const Footer = () => {
  return (
    <div className={styles.footer}>
      <Link href="https://github.com/VitorGabrielLisboa">
        Created by: Vitor Gabriel Lisboa
      </Link>
    </div>
  );
};
