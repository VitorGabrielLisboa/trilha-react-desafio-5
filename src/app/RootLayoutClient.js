// RootLayoutClient.js
"use client";

import { ScrollRestoration } from "./ScrollRestoration";
import { useUserSession } from "./hooks/userSession";
import { usePosts } from "./hooks/usePost";

export function RootLayoutClient({ children }) {
  const { loading: userLoading } = useUserSession();
  const { loading: postsLoading } = usePosts();

  const isLoaded = !userLoading && !postsLoading;

  return <ScrollRestoration isLoaded={isLoaded}>{children}</ScrollRestoration>;
}
