"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AUTO_LOGOUT_TIME = 120 * 60 * 1000;

export default function useAutoLogout() {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleLogout();
      }, AUTO_LOGOUT_TIME);
    };

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.dispatchEvent(new Event("authChanged"));

      router.replace("/login");
    };

    const events = ["mousemove", "mousedown", "click", "scroll", "keypress"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timeout);
    };
  }, [router]);
}
