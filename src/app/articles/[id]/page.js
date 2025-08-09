"use client";
import { useEffect, useState } from "react";
import { Header } from "../../components/Header/Header";
import { UserModal } from "../../components/UserModal/UserModal";
import { useUserSession } from "../../hooks/userSession";
import { Overlay } from "../../components/Overlay/Overlay";

import "../../styles/global.css";
import styles from "./styles.module.scss";
import { ArticleInfo } from "../components/ArticleInfo/ArticleInfo";
import { usePosts } from "@/app/hooks/usePost";
import { ClipLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Articles({ params }) {
  useEffect(() => {
    const handlePopState = () => {
      setTimeout(() => {
        const pathname = window.location.pathname;
        const savedPos =
          Number(sessionStorage.getItem(`scrollPos_${pathname}`)) || 0;
        window.scrollTo({ top: savedPos, behavior: "auto" });
      }, 100);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const { id } = params;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    post,
    loading: loadingPost,
    error,
  } = usePosts(
    id,
    `id,
    title,
    description,
    body,
    imgURL,
    created_at,
    profiles (userName, avatarURL)`
  );
  const router = useRouter();
  const {
    session,
    userName,
    userAvatarUrl,
    loading: userLoading,
    handleLogout,
    handleUserAvatarUpload,
  } = useUserSession();

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  if (loadingPost || userLoading) {
    return (
      <div className={styles.loadingContainer}>
        <ClipLoader color="#222" size={100} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.errorContainer}>
        <span>Page not found</span>
        <h1>404</h1>
        <button type="button">
          {" "}
          <Link href={"/"}>Home</Link>{" "}
        </button>
      </div>
    );
  }

  return (
    <>
      <Header
        userName={userName}
        isLoged={!!session}
        onLogoutClick={handleLogout}
        onUserAvatarUpload={handleUserAvatarUpload}
        hasAvatar={userAvatarUrl}
        onAvatarClick={() => setIsModalOpen(true)}
      />
      <main className={styles.main}>
        <ArticleInfo
          bannerUrl={post.imgURL}
          title={post.title}
          authorName={post.profiles.userName}
          authorProfileUrl={post.profiles.avatarURL}
          data={new Date(post.created_at).toLocaleDateString()}
          content={post.body}
        />
      </main>
      <UserModal
        isOpen={isModalOpen}
        onToggle={() => setIsModalOpen(!isModalOpen)}
        userName={userName}
        avatarUrl={userAvatarUrl}
        onLogout={() => {
          handleLogout();
          setIsModalOpen(false);
        }}
        onAvatarUpload={handleUserAvatarUpload}
      />
      <Overlay
        triggers={[
          { isOpen: isModalOpen, onClose: () => setIsModalOpen(false) },
        ]}
      />
    </>
  );
}
