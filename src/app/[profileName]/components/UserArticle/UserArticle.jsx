import { MdKeyboardArrowUp } from "react-icons/md";

import styles from "./styles.module.scss";
import { useRef, useState } from "react";
import { useClickOutside } from "@/app/hooks/useClickOutside";
import readingTime from "reading-time";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DeleteModal } from "../DeleteModal/DeleteModal";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);

export const UserArticle = ({
  title,
  lastEdited,
  postCreated,
  readTime,
  wordsLength,
  delFunction,
  deletionStep,
  postId,
  userName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  const router = useRouter();

  const handleEditClick = () => {
    console.log(userName);
    if (!userName) {
      console.error("Erro: username está undefined. Não é possível editar.");
      return;
    }
    router.push(`/${userName}/edit/${postId}`);
  };

  useClickOutside(modalRef, () => {
    setIsOpen(false);
  });
  const stats = readingTime(readTime);
  const postData = lastEdited ? lastEdited : postCreated;
  return (
    <>
      <div className={styles.card}>
        <h3>{title}</h3>
        <div className={styles.info}>
          <span>{`${lastEdited ? "Last Edited: " : "Created at:"} ${dayjs(
            postData
          ).fromNow()}`}</span>
          <div className={styles.dot}></div>
          <span>{stats.text}</span>
          <div className={styles.dot}></div>
          <span>{wordsLength} words</span>
          <div ref={modalRef} className={styles.dropdownMenuContainer}>
            <button onClick={() => setIsOpen(!isOpen)}>
              <MdKeyboardArrowUp className={isOpen ? styles.active : ""} />
            </button>
            {isOpen && (
              <ul className={styles.dropDownMenu}>
                <li onClick={handleEditClick}>Edit</li>
                <li onClick={delFunction}>Delete</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
