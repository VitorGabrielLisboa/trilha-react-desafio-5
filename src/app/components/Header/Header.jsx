"use client";
import { useState } from "react";
import { Button } from "../Button/Button";

import { UserModal } from "../UserModal/UserModal";
import styles from "./styles.module.scss";
import { LiaEdit } from "react-icons/lia";
import { MdPerson } from "react-icons/md";
import Link from "next/link";

export const Header = ({
  openLoginModal,
  openRegisterModal,
  isLoged,
  onWrittingPage,
  publishAction,
  userName,
  onLogoutClick,
  hasAvatar,
  onUserAvatarUpload,
  onProfileToggle,
  onAvatarClick,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const handleToggle = (isOpen) => {
    setProfileOpen(isOpen);
    onProfileToggle?.(isOpen);
  };
  return (
    <header className={styles.headerContainer}>
      <div className={styles.wrapper}>
        <h1>
          <Link href={"/"}>Articles</Link>
        </h1>
        <div className={styles.navbar}>
          <ul>
            {onWrittingPage ? (
              publishAction
            ) : (
              <li>
                {" "}
                <a href="/writte">
                  <LiaEdit />
                  Writte
                </a>
              </li>
            )}
          </ul>
          {isLoged ? (
            <div className={styles.avatar} onClick={onAvatarClick}>
              {hasAvatar ? (
                <img src={hasAvatar} alt="User Avatar" />
              ) : (
                <MdPerson />
              )}
            </div>
          ) : (
            <div className={styles.buttonBox}>
              <Button title="Login" onclick={openLoginModal} />
              <Button
                title="Cadastro"
                variant="true"
                onclick={openRegisterModal}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
