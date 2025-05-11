"use client";

import { useEffect, useState } from "react";
import API from "@/app/utils/api";
import Link from "next/link";

interface Order {
  id: number;
  user: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem("token");
      const response = await API.get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
    }

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-left mb-6">Orders</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="p-2 text-left">Order ID</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="p-2">{order.id}</td>
                <td className="p-2">{order.user.name}</td>
                <td className="p-2">${order.total}</td>
                <td className="p-2">{order.status}</td>
                <td className="p-2">
                  <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline mr-3">
                    View  
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
