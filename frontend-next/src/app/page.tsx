"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decrypt } from "@/app/utils/crypto";


export default function Home() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
      const token = localStorage.getItem("token");
      const encryptedUser = localStorage.getItem("user");
  
      if (token && encryptedUser) {
          try {
              const decryptedUser = decrypt(encryptedUser);
              const parsedUser = JSON.parse(decryptedUser);
  
              if (parsedUser.type === 1) {
                  router.replace("/admin/dashboard");
              } else {
                  router.replace("/");
              }
          } catch (error) {
              console.error("Failed to decrypt user data", error);
              setAuthLoading(false);
          }
      } else {
          setAuthLoading(false);
      }
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1>Welcome Home</h1>      
    </div>
  );
}
