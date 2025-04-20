"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import API from "@/app/utils/api";
import { encrypt } from "@/app/utils/crypto";
import { decrypt } from "@/app/utils/crypto";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errorMessage, setErrorMessage] = useState("");

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

        // console.log('test');
        // console.log(JSON.stringify(formData));
        // console.log(API.defaults.baseURL);

        try {
            const response = await API.post("/login", formData);
            console.log(response);
            if (response.status === 200) {  
                const { token, user } = response.data;

                localStorage.setItem("token", token);
                const encryptedUser = encrypt(JSON.stringify(user));
                localStorage.setItem("user", encryptedUser);                

                window.dispatchEvent(new Event("authChanged"));

                if (user.type === 1) {
                    router.replace("/admin/dashboard");
                } else {
                    router.replace("/");
                }
            }
        } catch (err) {
            const error = err as AxiosError;
            if (error.response) {
                if (error.response.status === 401) {
                    setErrorMessage("Invalid credentials");
                } else {
                    setErrorMessage("Invalid request");
                }
            } else {
                setErrorMessage("Network error. Please check your connection.");
            }
        } finally {
            setLoading(false);
          }
    };

    if (authLoading) {
        return null; // or a loading spinner
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Email"
                    
                />

                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Password"
                    
                />

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
