"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { MdCloudUpload } from "react-icons/md";
import styles from "./styles.module.scss";

export const ImgUploader = ({ onImageSelected, currentImageUrl }) => {
  const fileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || null);

  useEffect(() => {
    // Verifica se é uma URL blob válida ou usa Base64 diretamente
    if (!currentImageUrl) {
      setPreviewUrl(null);
      return;
    }

    if (currentImageUrl.startsWith("data:")) {
      setPreviewUrl(currentImageUrl);
      return;
    }

    // Testa URLs blob
    const img = new Image();
    img.src = currentImageUrl;
    img.onload = () => setPreviewUrl(currentImageUrl);
    img.onerror = () => {
      // Fallback para sessionStorage se blob falhar
      const savedData = sessionStorage.getItem("bannerData");
      if (savedData) {
        const { base64 } = JSON.parse(savedData);
        setPreviewUrl(base64);
      }
    };
  }, [currentImageUrl]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        fileRef.current = file; // Armazena o arquivo na referência
        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(newPreviewUrl);
        onImageSelected(file);
      }
    },
    [onImageSelected]
  );

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpeg", ".jpg"],
        "image/png": [".png"],
        "image/gif": [".gif"],
      },
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024, // 5 MB
    });

  const displayFileRejectionError = () => {
    if (fileRejections.length > 0) {
      const { errors } = fileRejections[0];
      const errorMessage = errors
        .map((err) => {
          switch (err.code) {
            case "file-too-large":
              return `O arquivo é muito grande (máx. 5MB).`;
            case "file-invalid-type":
              return `Tipo de arquivo inválido. Apenas JPG, PNG, GIF.`;
            case "too-many-files":
              return `Apenas um arquivo é permitido.`;
            default:
              return `Erro no arquivo: ${err.message}`;
          }
        })
        .join(", ");
      return <p className={styles.errorMessage}>{errorMessage}</p>;
    }
    return null;
  };

  return (
    <div
      {...getRootProps()}
      className={`${styles.dropzoneContainer} ${
        isDragActive ? styles.active : ""
      } ${previewUrl ? styles.removeBorder : ""}`}
    >
      <input {...getInputProps()} />
      {previewUrl && (
        <>
          <img src={previewUrl} alt="Preview" className={styles.imagePreview} />
          <div className={styles.imageOverlay}>
            <MdCloudUpload className={styles.uploadIconHover} />
          </div>
        </>
      )}
      {!previewUrl && (
        <>
          <MdCloudUpload size={40} className={styles.uploadIcon} />
          {isDragActive ? (
            <p className={styles.dropText}>Solte a imagem aqui...</p>
          ) : (
            <p className={styles.dropText}> Upload a banner</p>
          )}
        </>
      )}
      {displayFileRejectionError()}
    </div>
  );
};
