import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCallback, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

const loginSchema = yup
  .object({
    email: yup
      .string()
      .email("Email inválido")
      .required("Campo 'E-mail' é obrigatório"),
    password: yup
      .string()
      .min(5, "No mínimo 5 caracteres")
      .required("Campo 'Senha' é obrigatório"),
  })
  .required();

const registerSchema = yup
  .object({
    name: yup.string().required("Campo 'Nome' é obrigatório"),
    email: yup
      .string()
      .email("Email inválido")
      .required("Campo 'E-mail' é obrigatório"),
    password: yup
      .string()
      .min(5, "No mínimo 5 caracteres")
      .required("Campo 'Senha' é obrigatório"),
  })
  .required();

export const useAuthModal = () => {
  const [modalForm, setModalForm] = useState(false);
  const [switchForm, setSwitchForm] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(setSwitchForm ? loginSchema : registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSetLogin = useCallback(() => {
    setSwitchForm(true);
    reset();
  }, [reset]);

  const handleSetRegister = useCallback(() => {
    setSwitchForm(false);
    reset();
  }, [reset]);

  const handleToggleModal = useCallback(() => {
    setModalForm((prev) => !prev);
    reset();
  }, [reset]);

  const onSubmitLogin = useCallback(async (data) => {
    const { email, password } = data;
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      toast.success("Successfully SignIn");
      setModalForm(false);
    } catch (err) {
      console.error("Error on SignIn", err.message);
      toast.error(`Error on SignIn: ${err.message}`);
    }
  }, []);

  const onSubmitRegister = useCallback(
    async (data) => {
      const { email, password, name } = data;
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              userName: name,
            });
          if (profileError) {
            console.error("Error on create profile", profileError.message);
            toast.warn(
              "User created, but there was a problem setting up the profile."
            );
          }
        }
        toast.success("Successfully SignUp");
        handleToggleModal();
      } catch (error) {
        console.error("Error on SignUp", error.message);
        toast.error(`Error on SignUp: ${error.message}`);
      }
    },
    [handleToggleModal]
  );

  return {
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
  };
};
