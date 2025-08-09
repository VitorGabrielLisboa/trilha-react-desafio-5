"use client";
import { Header } from "@/app/components/Header/Header";
import { Overlay } from "@/app/components/Overlay/Overlay";
import { UserModal } from "@/app/components/UserModal/UserModal";
import { useUserSession } from "@/app/hooks/userSession";
import { useEffect, useState } from "react";

import "../../../styles/global.css";
import styles from "./styles.module.scss";

import { RichTextEditor } from "@/app/writte/components/RichTextEditor/RichTextEditor";
import { ImgUploader } from "@/app/components/ImgUploader/ImgUploader";
import { ClipLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { useImagePersistence } from "@/app/hooks/useImagePersistence";
import { toast, ToastContainer } from "react-toastify";

export default function EditArticlePage({ params }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isPostLoading, setIsPostLoading] = useState(true);

  const { postId } = params;
  const { register, handleSubmit, reset, setValue } = useForm();

  const router = useRouter();
  const {
    session,
    userName,
    userAvatarUrl,
    loading: userLoading,
    handleLogout,
    handleUserAvatarUpload,
  } = useUserSession();

  const { imagePreview, handleImageSelected, currentFile } =
    useImagePersistence(setValue, "banner");

  useEffect(() => {
    async function fetchPost() {
      if (!postId) {
        setIsPostLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single();

        if (error) throw error;

        if (data) {
          reset({
            title: data.title,
          });
          setEditorContent(data.body);
          setCurrentImageUrl(data.imgURL);
        }
      } catch (err) {
        console.error("Error fetching post:", error);
      } finally {
        setIsPostLoading(false);
      }
    }
    fetchPost();
  }, [postId, reset]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  if (userLoading) {
    return (
      <ClipLoader
        color="#222"
        size={100}
        loading={true}
        className={styles.spinner}
      />
    );
  }
  if (!session) {
    router.push("/");
    return null;
  }

  if (userLoading || isPostLoading) {
    return (
      <ClipLoader
        color="#222"
        size={100}
        loading={true}
        className={styles.spinner}
      />
    );
  }

  const onSubmit = async ({ title }) => {
    setIsPublishing(true);
    let finalImageUrl = currentImageUrl;
    try {
      if (currentFile) {
        const filePath = `post_covers/${postId}-${Date.now()}`;
        const { data: uploadData, error: uploadError } = await supabase
          .from("post-images")
          .upload(filePath, currentFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = await supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);
        finalImageUrl = publicUrlData.publicUrl;
      }

      const { data: uploadData, error: updateError } = await supabase
        .from("posts")
        .update({
          title,
          body: editorContent,
          imgURL: finalImageUrl,
          update_at: new Date().toISOString(),
        })
        .eq("id", postId);

      toast.success("Article updated successfully!");
    } catch (err) {
      console.error("Error updating article:", err.message);
      toast.error(`Error updating article: ${err.message}`);
    } finally {
      setIsPublishing(false);
      router.push(`/articles/${postId}`);
    }
  };

  const updateButton = (
    <button
      disabled={isPublishing}
      className={styles.publishButton}
      onClick={handleSubmit(onSubmit)}
    >
      {isPublishing ? "Updating..." : "Update"}
    </button>
  );
  return (
    <>
      <Header
        userName={userName}
        isLoged={!!session}
        onLogoutClick={handleLogout}
        onUserAvatarUpload={handleUserAvatarUpload}
        hasAvatar={userAvatarUrl}
        onWrittingPage={true}
        publishAction={updateButton}
        onAvatarClick={() => setIsModalOpen(true)}
      />
      <main className={styles.main}>
        <form>
          <ImgUploader
            onImageSelected={handleImageSelected}
            currentImageUrl={imagePreview || currentImageUrl}
          />
          <textarea
            {...register("title")}
            className={styles.titleInput}
            placeholder="Title"
            autoComplete="off"
          />

          <RichTextEditor
            onContentChange={setEditorContent}
            initialContent={editorContent}
          />
        </form>
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
