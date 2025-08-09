"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

export function useUserSession() {
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSessionAndProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession && currentSession.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("userName, avatarURL")
          .eq("id", currentSession.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Erro ao buscar perfil: ", profileError.message);
          toast.error("Erro on load profile data.");
          setUserName(
            currentSession.user.user_metadata?.full_name ||
              currentSession.user.email?.split("@")[0] ||
              "User"
          );
          setUserAvatarUrl(null);
        } else if (profileData) {
          setUserName(profileData.userName);
          setUserAvatarUrl(profileData.avatarURL);
        } else {
          setUserName(
            currentSession.user.user_metadata?.full_name ||
              currentSession.user.email?.split("@")[0] ||
              "User"
          );
          setUserAvatarUrl(null);
          console.warn("User logged, but profile not found in 'profile' table");
        }
      } else {
        setUserName(null);
        setUserAvatarUrl(null);
      }
    } catch (error) {
      console.error("Erro on search session", error.message);
      toast.error("Error on inicializate session");
      setSession(null);
      setUserName(null);
      setUserAvatarUrl(null);
    } finally {
      setLoading(false);
    }
  }, []);

  //function to search inicial session && save state changes
  useEffect(() => {
    fetchSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      // console.log(
      //   "onAuthStateChange triggered. Event: ",
      //   _event,
      //   "Session: ",
      //   currentSession
      // );
      setSession(currentSession);
      fetchSessionAndProfile();
    });
    return () => subscription.unsubscribe();
  }, [fetchSessionAndProfile]);

  //logout function
  const handleLogout = useCallback(async () => {
    try {
      console.log("Trying logout");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Successfully Logout");
    } catch (error) {
      console.log("Error on Logout", error.message);
      toast.error(`Error on Logout ${error.message}`);
    }
  }, []);

  //avatar upload
  const handleUserAvatarUpload = useCallback(
    async (file) => {
      if (!session || !session.user) {
        toast.error("You need be logged");
        return;
      }
      const userId = session.user.id;
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });
        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error("Wasn't possible obtain avatar URL");
        }

        const newAvatarUrl = publicUrlData.publicUrl;

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ avatarURL: newAvatarUrl })
          .eq("id", userId);

        if (updateError) {
          throw updateError;
        }

        setUserAvatarUrl(newAvatarUrl);
        toast.success("Profile sent and saved sucessfully");
      } catch (error) {
        console.log("error on upload/update of avatar", error.message);
        toast.error(`Error on sent avatar: ${error.message}`);
      }
    },
    [session]
  );

  return {
    session,
    userName,
    userAvatarUrl,
    loading,
    handleLogout,
    handleUserAvatarUpload,
  };
}
