import readingTime from "reading-time";

import styles from "./styles.module.scss";

export const ArticleInfo = ({
  bannerUrl,
  title,
  authorProfileUrl,
  authorName,
  data,
  content = "Test",
}) => {
  const stats = readingTime(content);
  return (
    <div className={styles.articleInfoWrap}>
      <img src={bannerUrl} className={styles.bannerImage} />
      <div className={styles.articleHeader}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.headerDetails}>
          <img src={authorProfileUrl} alt="" className={styles.authorProfile} />
          <p>{authorName}</p>
          <div className={styles.dataInfo}>
            <span>{stats.text}</span>
            <div className={styles.dot}></div>
            <span>{data}</span>
          </div>
        </div>
      </div>
      <span className={styles.line}></span>
      <div
        className={styles.bodyContent}
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>
    </div>
  );
};
