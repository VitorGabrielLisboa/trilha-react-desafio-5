"use client";

import { useRouter } from "next/navigation";
import { useUserSession } from "../hooks/userSession";
import { Header } from "../components/Header/Header";
import { Overlay } from "../components/Overlay/Overlay";
import { UserModal } from "../components/UserModal/UserModal";
import { useEffect, useState } from "react";

import "../styles/global.css";
import styles from "./styles.module.scss";
import { UserArticle } from "./components/UserArticle/UserArticle";
import { usePosts } from "../hooks/usePost";

import { DeleteModal } from "./components/DeleteModal/DeleteModal";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import Link from "next/link";

export default function ProfilePage({ params }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const router = useRouter();
  const { profileName } = params;
  const handleOpenDeleteModal = (post) => {
    setPostToDelete(post);
  };

  const handleCloseDeleteModal = () => {
    setPostToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postToDelete.id);

      if (error) {
        throw error;
      }
      toast.success("Article successfully deleted");
      handleCloseDeleteModal();
      fetchPosts();
    } catch (err) {
      console.error("Error on deleting post:", err.message);
      toast.error(`Error on deleting post: ${err.message}`);
    }
  };

  const {
    session,
    userName,
    userAvatarUrl,
    loading: userLoading,
    handleLogout,
    handleUserAvatarUpload,
  } = useUserSession();

  const {
    posts,
    loading: postsLoading,
    error,
    fetchPosts,
  } = usePosts(
    null,
    `id, title, created_at, update_at, body, profiles (userName, avatarURL)`,
    profileName
  );

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  if (userLoading || postsLoading) {
    return (
      <ClipLoader
        color="#222"
        size={100}
        loading={true}
        className={styles.spinner}
      />
    );
  }
  if (posts && posts.length === 0) {
    return (
      <div>
        <div className={styles.errorContainer}>
          <span>You don&apos;t have articles.</span>
          <h1>😭</h1>
          <button type="button">
            {" "}
            <Link href={"/"}>Home</Link>{" "}
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Ocorreu um erro ao buscar os artigos.</div>;
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
        <h1>Your Articles</h1>

        {posts?.map((post) => {
          // console.log(post.profiles.userName);
          return (
            <UserArticle
              key={post.id}
              title={post.title}
              userName={post.profiles.userName}
              readTime={post.body}
              lastEdited={post.update_at}
              postCreated={post.created_at}
              wordsLength={`${post.body.length}`}
              postId={post.id}
              delFunction={() => handleOpenDeleteModal(post)}
            />
          );
        })}
      </main>
      {postToDelete ? (
        <DeleteModal
          title={postToDelete.title}
          onCancel={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      ) : null}

      <UserModal
        isOpen={isModalOpen}
        onToggle={() => setIsModalOpen(!isModalOpen)}
        userName={userName}
        avatarUrl={userAvatarUrl}
        onLogout={handleLogout}
        onAvatarUpload={handleUserAvatarUpload}
      />
      <Overlay
        triggers={[
          { isOpen: isModalOpen, onClose: () => setIsModalOpen(false) },
          { isOpen: postToDelete, onClose: () => setPostToDelete(null) },
        ]}
      />
    </>
  );
}
