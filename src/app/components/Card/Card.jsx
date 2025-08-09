import { Button } from "../Button/Button";
import styles from "./styles.module.scss";

const TruncatedText = ({ text, maxLength }) => {
  if (!text) {
    return null;
  }
  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }

  const truncated = text.substring(0, maxLength) + "...";
  return <span className={styles.descriptionText}>{truncated}</span>;
};
export const Card = ({
  title,
  author,
  description,
  thumbnail,
  authorAvatar,
}) => {
  const text = description.split("\n")[0];
  return (
    <div className={styles.cardContainer}>
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <div className={styles.authorContainer}>
            <img
              className={styles.authorProfile}
              src={authorAvatar}
              alt={`${author} avatar`}
            />
            {author}
          </div>
          <h2>{title}</h2>
        </div>
        <div className={styles.description}>
          <TruncatedText text={text} maxLength={132} />
        </div>
      </div>
      <img src={thumbnail} alt={title} />
    </div>
  );
};
