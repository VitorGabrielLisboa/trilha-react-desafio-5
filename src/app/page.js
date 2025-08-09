"use client";
import { supabase } from "./lib/supabaseClient";
import { ClipLoader } from "react-spinners";
import { Card } from "./components/Card/Card";
import { Header } from "./components/Header/Header";
import { Input } from "./components/Input/Input";
import { MdClose, MdEmail, MdLock, MdPerson } from "react-icons/md";
import { Button } from "./components/Button/Button";
import { useEffect, useState } from "react";

import "./styles/global.css";
import styles from "./styles/page.module.scss";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useUserSession } from "./hooks/userSession";
import { usePosts } from "./hooks/usePost";
import { UserModal } from "./components/UserModal/UserModal";
import { Overlay } from "./components/Overlay/Overlay";
import { useAuthModal } from "./hooks/useAuthModal";

import Link from "next/link";
import { Footer } from "./components/Footer/Footer";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    modalForm,
    switchForm,
    handleSetLogin,
    handleSetRegister,
    handleToggleModal,
    control,
    handleSubmit,
    errors,
    onSubmitLogin,
    onSubmitRegister,
  } = useAuthModal();

  //login hook
  const {
    session,
    userName,
    userAvatarUrl,
    loading,
    handleLogout,
    handleUserAvatarUpload,
  } = useUserSession();

  const { posts, loading: loadingPosts, error: postsError } = usePosts();

  const handleOpenModalLogin = () => {
    handleToggleModal();
    handleSetLogin();
  };
  const handleOpenModalRegister = () => {
    handleToggleModal();
    handleSetRegister();
  };

  //cancela scroll quando há overlay
  const isAnyModalOpen = modalForm || isModalOpen;
  useEffect(() => {
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  return (
    <div className={""}>
      <Header
        openLoginModal={handleOpenModalLogin}
        openRegisterModal={handleOpenModalRegister}
        userName={userName}
        isLoged={!!session}
        onLogoutClick={handleLogout}
        onUserAvatarUpload={handleUserAvatarUpload}
        hasAvatar={userAvatarUrl}
        onAvatarClick={() => setIsModalOpen(true)}
      />
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
      <main className={styles.main}>
        <h1>Articles</h1>
        <div className={styles.cardContainer}>
          {loadingPosts ? (
            <ClipLoader color="#222" size={50} loading={true} />
          ) : (
            posts.map((post) => {
              return (
                <Link
                  style={{ textDecoration: "none", color: "inherit" }}
                  key={post.id}
                  href={`/articles/${post.id}`}
                >
                  <Card
                    author={post.profiles.userName}
                    description={post.description}
                    authorAvatar={post.profiles.avatarURL}
                    thumbnail={post.imgURL}
                    title={post.title}
                  />
                </Link>
              );
            })
          )}
          {posts.length === 0 && !loadingPosts && (
            <p>Nenhum post encontrado.</p>
          )}
        </div>
      </main>
      {modalForm &&
        (switchForm ? (
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmitLogin)}
            noValidate
          >
            <span className={styles.icon} onClick={handleToggleModal}>
              <MdClose />
            </span>
            <h2>Welcome Back</h2>
            <div className={styles.inputContainer}>
              <Input
                name="email"
                title="Email"
                type="email"
                icon={<MdEmail />}
                erro={errors?.email?.message}
                control={control}
              />
              <Input
                name="password"
                title="Password"
                type="password"
                icon={<MdLock />}
                erro={errors?.password?.message}
                control={control}
              />
              <Button title="Login" type="submit" />
            </div>
            <p>
              No account ? <span onClick={handleSetRegister}>Create One</span>
            </p>
          </form>
        ) : (
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmitRegister)}
            noValidate
          >
            <span className={styles.icon} onClick={handleToggleModal}>
              <MdClose />
            </span>
            <h2>Join Blog</h2>
            <div className={styles.inputContainer}>
              <Input
                name="name"
                title="Name"
                type="text"
                icon={<MdPerson />}
                control={control}
              />
              <Input
                name="email"
                title="Email"
                type="email"
                icon={<MdEmail />}
                control={control}
              />
              <Input
                name="password"
                title="Password"
                type="password"
                icon={<MdLock />}
                control={control}
              />
              <Button title="Register" />
            </div>
            <p>
              Already have an account?{" "}
              <span onClick={handleSetLogin}>Sign in</span>
            </p>
          </form>
        ))}
      <Overlay
        className={styles.grayBackground}
        triggers={[
          { isOpen: modalForm, onClose: () => modalForm(false) },
          { isOpen: isModalOpen, onClose: () => setIsModalOpen(false) },
        ]}
      />
    </div>
  );
}
