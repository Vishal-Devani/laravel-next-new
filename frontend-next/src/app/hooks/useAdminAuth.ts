"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decrypt } from "@/app/utils/crypto";

export default function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const encryptedUser = localStorage.getItem("user");

    if (token && encryptedUser) {
      try {
        const decryptedUser = decrypt(encryptedUser);
        const parsedUser = JSON.parse(decryptedUser);

        if (parsedUser.type !== 1) {
          router.replace("/");
        } else {
          setUser(parsedUser);
        }
      } catch (err) {
        console.error("Decryption failed", err);
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }

    setLoading(false);
  }, []);

  return { user, loading };
}
