"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { decrypt } from "@/app/utils/crypto";
import API from "@/app/utils/api";


export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await API.post("/register", formData);
      
      if (response.status  === 200) {
        alert("Registration successful! Please login.");
        router.push("/login");
      }
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
          if (error.response.status === 401) {
              setErrorMessage("Registration failed.");
          } else {
              setErrorMessage("Invalid request.");
          }
      } else {
          setErrorMessage("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Full Name"
          required
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Email"
          required
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Password"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
