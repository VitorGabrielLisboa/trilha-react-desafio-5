"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export const useImagePersistence = (setValue, formKey = "banner") => {
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  const convertToBase64 = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleImageSelected = useCallback(
    async (file) => {
      if (fileRef.current?.previewUrl) {
        URL.revokeObjectURL(fileRef.current.previewUrl);
      }

      const previewUrl = URL.createObjectURL(file);
      const base64 = await convertToBase64(file);

      fileRef.current = { file, previewUrl };
      setImagePreview(previewUrl);
      setValue(formKey, file);

      sessionStorage.setItem(
        "bannerData",
        JSON.stringify({ base64, name: file.name, type: file.type })
      );
    },
    [convertToBase64, setValue, formKey]
  );

  const restoreImage = useCallback(() => {
    const savedData = sessionStorage.getItem("bannerData");
    if (!savedData) return;

    const { base64, name, type } = JSON.parse(savedData);

    setImagePreview(base64);

    if (base64.startsWith("data:")) {
      fetch(base64)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], name, { type });
          fileRef.current = { file, previewUrl: base64 };
          setValue(formKey, file);
        });
    }
  }, [setValue, formKey]);

  useEffect(() => {
    return () => {
      if (fileRef.current?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(fileRef.current.previewUrl);
      }
    };
  }, []);

  return {
    imagePreview,
    handleImageSelected,
    currentFile: fileRef.current?.file,
  };
};
