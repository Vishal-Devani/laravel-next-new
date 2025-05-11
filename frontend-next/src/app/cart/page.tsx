"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/app/utils/api";
import Link from "next/link";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchCartAndUser = async () => {
      try {
        const [cartRes, userRes] = await Promise.all([
          API.get("/cart", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setItems(cartRes.data.items);
        setTotal(cartRes.data.total);
        setUser(userRes.data.user);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load cart or user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndUser();
  }, []);

  const handleCheckout = () => {
    if (!user?.profile_update) {
      setError("Please complete your profile before checking out.");
      return;
    }

    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg">
        Loading cart details...
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

        {items.length === 0 ? (
          <p>Your cart is empty. <Link href="/" className="text-blue-600 underline">Continue shopping</Link></p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id}>
                  <td className="p-2 border">{item.product?.name}</td>
                  <td className="p-2 border">${item.price}</td>
                  <td className="p-2 border">{item.quantity}</td>
                  <td className="p-2 border">${item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Summary</h2>
        <p className="text-lg">Total: <strong>${total}</strong></p>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        <button
          onClick={handleCheckout}
          className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={items.length === 0}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
