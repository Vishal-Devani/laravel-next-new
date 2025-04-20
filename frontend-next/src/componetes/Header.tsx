    "use client";

    import { useEffect, useState } from "react";
    import Link from "next/link";
    import { useRouter } from "next/navigation";
    import API from "@/app/utils/api";
    import { decrypt } from "@/app/utils/crypto";

    export default function Header() {
        const router = useRouter();
        const [user, setUser] = useState<any>(null);

        useEffect(() => {
            const loadUser = () => {
                const encryptedUser = localStorage.getItem("user");
            
                if (encryptedUser) {
                    try {
                        const decrypted = decrypt(encryptedUser);
                        const parsed = JSON.parse(decrypted);
                        setUser(parsed);
                    } catch (err) {
                        console.error("Failed to decrypt or parse user data", err);
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            };

            loadUser();

            window.addEventListener("storage", loadUser);
            window.addEventListener("authChanged", loadUser);

            return () => {
                window.removeEventListener("storage", loadUser);
                window.removeEventListener("authChanged", loadUser);
            };
        }, []);

        const handleLogout = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                await API.post("/logout", null, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.dispatchEvent(new Event("authChanged"));

                router.replace("/login");
            } catch (error) {
                console.error("Logout failed", error);
            }
        };

        return (
            <header className="flex justify-between items-center px-6 py-4 bg-gray-100 shadow">
                <div className="text-xl font-bold">Logo</div>
                <ul className="flex space-x-4">
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/products">Shop</Link></li>
                    {!user && (
                        <>
                            <li><Link href="/login">Login</Link></li>
                            <li><Link href="/register">Register</Link></li>
                        </>
                    )}

                    {user && (
                        <>
                            <li className="cursor-pointer" onClick={handleLogout}>Logout</li>
                        </>
                    )}
                </ul>
            </header>
        );
    }
