"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

/**
 * @param {string | null} postId
 * @param {string} selectFields
 *@param {string | null} userId

 * @returns {{posts: Array, post: Object | null, loading: boolean, error: Error | null, fetchPosts: Function}}
 */

export const usePosts = (
  postId = null,
  selectFields = `id, title, description, imgURL, created_at, profiles (userName, avatarURL), update_at`,
  profileName = null
) => {
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileId, setProfileId] = useState(null);

  const fetchPosts = useCallback(async () => {
    if (profileName && !profileId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("posts").select(selectFields);
      if (postId) {
        query = query.eq("id", postId).single();
      } else if (profileId) {
        query = query
          .eq("authorId", profileId)
          .order("update_at", { ascending: false })
          .order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (postId) {
        setPost(data);
        setPosts([]);
      } else {
        setPosts(data || []);
        setPost(null);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err);
      toast.error(`Error fetching posts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [postId, selectFields, profileId, profileName]);

  useEffect(() => {
    async function getProfileId() {
      if (!profileName) {
        setProfileId(null);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("userName", profileName)
          .single();

        if (error || !data) {
          throw error || new Error("Profile not found");
        }
        setProfileId(data.id);
      } catch (err) {
        console.error("Error fetching profile ID:", err);
        setError(err);
        setProfileId(null);
      } finally {
        setLoading(false);
      }
    }

    getProfileId();
  }, [profileName]);

  useEffect(() => {
    if (postId || profileId || !profileName) {
      fetchPosts();
    }
  }, [fetchPosts, postId, profileId, profileName]);

  if (postId) {
    return { post, loading, error, fetchPosts };
  } else {
    return { posts, loading, error, fetchPosts };
  }
};

// ancora
