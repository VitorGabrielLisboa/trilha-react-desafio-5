"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ScrollRestoration({ children, isLoaded }) {
  const pathname = usePathname();
  const scrollPositions = useRef({});
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!isLoaded) return; // só roda se o conteúdo estiver carregado

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const saveScrollPosition = () => {
      scrollPositions.current[pathname] = window.scrollY;
      sessionStorage.setItem(
        `scrollPos:${pathname}`,
        window.scrollY.toString()
      );
    };

    const restoreScrollPosition = () => {
      const pos =
        scrollPositions.current[pathname] ||
        parseInt(sessionStorage.getItem(`scrollPos:${pathname}`), 10) ||
        0;

      // Use requestAnimationFrame para garantir que o DOM está pronto
      requestAnimationFrame(() => {
        window.scrollTo({
          top: pos,
          behavior: isInitialLoad.current ? "auto" : "instant",
        });
      });
    };

    window.addEventListener("scroll", saveScrollPosition, { passive: true });
    window.addEventListener("beforeunload", saveScrollPosition);
    window.addEventListener("popstate", restoreScrollPosition);

    restoreScrollPosition();
    isInitialLoad.current = false;

    return () => {
      window.removeEventListener("scroll", saveScrollPosition);
      window.removeEventListener("beforeunload", saveScrollPosition);
      window.removeEventListener("popstate", restoreScrollPosition);
    };
  }, [pathname, isLoaded]);

  return children;
}
