//write.page
"use client";
import { Header } from "../components/Header/Header";
import { ClipLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import styles from "./styles.module.scss";
import "../styles/global.css";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { RichTextEditor } from "./components/RichTextEditor/RichTextEditor";
import { useForm } from "react-hook-form";
import { ImgUploader } from "../components/ImgUploader/ImgUploader";
import { UserModal } from "../components/UserModal/UserModal";
import { Overlay } from "../components/Overlay/Overlay";

import { useUserSession } from "../hooks/userSession";
import { useImagePersistence } from "../hooks/useImagePersistence";
import { useFormValidation } from "../hooks/useFormValidation";
import { supabase } from "../lib/supabaseClient";

export default function Writte() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);

  //Session
  const router = useRouter();
  const {
    session,
    userName,
    userAvatarUrl,
    loading,
    reset,
    handleLogout,
    handleUserAvatarUpload,
  } = useUserSession();

  //useForm
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: "",
      content: "",
      banner: null,
    },
  });
  const editorContent = watch("content");

  const { imagePreview: bannerPreview, handleImageSelected } =
    useImagePersistence(setValue);
  const { isPublishDisabled } = useFormValidation(watch);

  //onSubmit artigo
  const onSubmit = async (data) => {
    setIsPublishing(true);
    setError(null);

    const { title, content, banner } = data;
    let publicUrl = null;

    // Apenas verifique se a sessão e o usuário existem. Não é necessário fazer uma nova requisição.
    if (!session || !session.user) {
      toast.error("You need to be logged in to publish articles");
      setIsPublishing(false);
      return;
    }

    try {
      if (banner) {
        const fileName = `${Date.now()}-${banner.name}`;

        const { error: uploadError } = await supabase.storage
          .from("article-banners")
          .upload(fileName, banner);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("article-banners")
          .getPublicUrl(fileName);

        publicUrl = urlData.publicUrl;
      }
      let firstParagraphText = "";
      if (typeof content === "string") {
        // Procura pelo conteúdo do primeiro <p> ou <blockquote>
        const firstBlockMatch = content.match(
          /<p[^>]*>(.*?)<\/p>|<blockquote[^>]*>(.*?)<\/blockquote>/
        );
        if (firstBlockMatch) {
          // Usa o conteúdo do grupo de captura que não é undefined
          const firstBlockContent = firstBlockMatch[1] || firstBlockMatch[2];
          // Remove as tags internas e pega o texto limpo
          firstParagraphText = firstBlockContent
            ? firstBlockContent.replace(/<[^>]*>/g, "").trim()
            : "";
        } else {
          // Fallback caso não encontre <p> ou <blockquote>
          firstParagraphText = content
            .replace(/<[^>]*>/g, "")
            .trim()
            .split("\n")[0];
        }
      }

      const words = firstParagraphText.split(" ");

      const description =
        words.length <= 30
          ? firstParagraphText
          : words.slice(0, 30).join(" ") + "...";

      const { error: insertError } = await supabase.from("posts").insert({
        title: title,
        body: content,
        description: description,
        authorId: session.user.id,
        imgURL: publicUrl,
      });

      if (insertError) {
        throw insertError;
      }

      toast.success("Article successfully published");
      // reset();
      router.push("/");
    } catch (err) {
      console.error("Error on pushing article", err.message);
      toast.error(`Error on publishing article: ${err.message}`);
      setError(err);
    } finally {
      setIsPublishing(false);
    }
  };

  // proteção de rota
  useEffect(() => {
    if (!loading && !session) {
      router.push("/");
    }
  }, [session, loading, router]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  //guarda a posição da tela
  if (loading) {
    return (
      <ClipLoader
        color="#222"
        size={100}
        loading={true}
        className={styles.spinner}
      />
    );
  }
  const publishButton = (
    <button
      disabled={isPublishDisabled || isPublishing}
      className={styles.publishButton}
      onClick={handleSubmit(onSubmit)}
    >
      {isPublishing ? "Publishing..." : "Publish"}
    </button>
  );

  return (
    <>
      <Header
        userName={userName}
        isLoged={!!session}
        onLogoutClick={handleLogout}
        hasAvatar={userAvatarUrl}
        onUserAvatarUpload={handleUserAvatarUpload}
        onWrittingPage={true}
        publishAction={publishButton}
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <ImgUploader
            onImageSelected={handleImageSelected}
            currentImageUrl={bannerPreview}
          />
          <textarea
            {...register("title")}
            className={styles.titleInput}
            placeholder="Title"
            autoComplete="off"
          />

          <RichTextEditor
            onContentChange={(newContent) => setValue("content", newContent)}
            initialContent={editorContent}
          />
        </form>
      </main>
      <Overlay
        triggers={[
          { isOpen: isModalOpen, onClose: () => setIsModalOpen(false) },
        ]}
      />
    </>
  );
}
