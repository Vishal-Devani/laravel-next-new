"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/app/utils/api";
import { encrypt } from "@/app/utils/crypto";
import { decrypt } from "@/app/utils/crypto";

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
          setFormData({ name: parsedUser.name, email: parsedUser.email });
        }
      } catch (err) {
        console.error("Decryption failed", err);
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const token = localStorage.getItem("token");

    try {
      const res = await API.post("/profile/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = res.data.user;

      const encrypted = encrypt(JSON.stringify(updatedUser));
      localStorage.setItem("user", encrypted);
      window.dispatchEvent(new Event("authChanged"));

      setSuccessMsg("Profile updated successfully");
    }catch (err: any) {
        if (err.response && err.response.status === 422) {
          const errors = err.response.data.errors;
          if (errors.email) {
            setErrorMsg(errors.email[0]);
          } else if (errors.name) {
            setErrorMsg(errors.name[0]);
          } else {
            setErrorMsg("Validation error");
          }
        } else {
          setErrorMsg("Failed to update profile");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Update Profile</h2>

      {successMsg && <p className="text-green-600 mb-2">{successMsg}</p>}
      {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full p-2 border border-gray-300 rounded"
          required
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="w-full p-2 border border-gray-300 rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
