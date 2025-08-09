// components/UserModal/UserModal.js
"use client";

import { MdClose, MdPerson, MdCloudUpload } from "react-icons/md";
import styles from "./styles.module.scss";
import { Button } from "../Button/Button";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";

import { toast } from "react-toastify";
import Link from "next/link";

export const UserModal = ({
  avatarUrl,
  userName,
  onLogout,
  onAvatarUpload,
  isOpen,
  onToggle,
}) => {
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(avatarUrl);
  const router = useRouter();

  useEffect(() => {
    setPreviewAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  const handleToggleProfile = () => {
    onToggle(!isOpen);
    if (isOpen && !avatarUrl) {
      setPreviewAvatarUrl(null);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewAvatarUrl(newPreviewUrl);

        if (onAvatarUpload) {
          onAvatarUpload(file);
        }
        toast.success("Selected Image! Uploading...");
      }
    },
    [onAvatarUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpeg", ".jpg"],
        "image/png": [".png"],
      },
      maxFiles: 1,
      maxSize: 2 * 1024 * 1024, // 2 MB
    });

  const displayFileRejectionError = () => {
    if (fileRejections.length > 0) {
      const { errors } = fileRejections[0];
      const errorMessage = errors
        .map((err) => {
          switch (err.code) {
            case "file-too-large":
              return `A imagem é muito grande (máx. 2MB).`;
            case "file-invalid-type":
              return `Tipo de arquivo inválido. Apenas JPG/PNG.`;
            case "too-many-files":
              return `Apenas uma imagem é permitida.`;
            default:
              return `Erro no arquivo: ${err.message}`;
          }
        })
        .join(", ");
      toast.error(errorMessage);
    }
    return null;
  };

  return (
    <>
      <div className={styles.userModalContainer}>
        {isOpen && (
          <div className={`${styles.perfilDetails} ${styles.actived}`}>
            <span className={styles.icon} onClick={() => onToggle(false)}>
              <MdClose />
            </span>

            <div
              {...getRootProps()}
              className={`${styles.perfilAvatar} ${
                isDragActive ? styles.activeDropzone : ""
              }`}
            >
              <input {...getInputProps()} />
              {previewAvatarUrl ? (
                <img src={previewAvatarUrl} alt="Preview Avatar" />
              ) : (
                <MdPerson className={styles.userIcon} />
              )}
              <div className={styles.dropzoneOverlay}>
                <MdCloudUpload className={styles.uploadOverlayIcon} />
              </div>
            </div>
            {displayFileRejectionError()}

            <h2>{userName || "Usuário"}</h2>
            <ul>
              <li>
                <Link
                  style={{ textDecoration: "none", color: "inherit" }}
                  href={`/${userName}`}
                >
                  My Articles
                </Link>
              </li>
            </ul>
            <Button title="Logout" onclick={onLogout} />
          </div>
        )}
      </div>
    </>
  );
};
