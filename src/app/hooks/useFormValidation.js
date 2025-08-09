"use client";
import { useCallback } from "react";

export const useFormValidation = (
  watch,
  fieldsToValidate = ["title", "content"]
) => {
  const validateForm = useCallback(() => {
    const values = watch(fieldsToValidate);
    const content = values[1] || "";
    const cleanContent = content.replace(/<[^>]*>/g, "").trim();

    const isTitleEmpty = !values[0] || values[0].trim() === "";
    const isContentEmpty = cleanContent === "";

    return {
      isTitleEmpty,
      isContentEmpty,
      isPublishDisabled: isTitleEmpty || isContentEmpty,
    };
  }, [watch, fieldsToValidate]);

  return validateForm();
};
