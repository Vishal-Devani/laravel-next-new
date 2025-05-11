"use client";

import { useEffect, useState } from "react";
import API from "@/app/utils/api";

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem("token");
      try {
        const response = await API.get("/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserCount(response.data.userCount);
        setOrderCount(response.data.orderCount);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-center mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-medium mb-2">Total Users</h2>
          <p className="text-2xl font-bold">{userCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-medium mb-2">Total Orders</h2>
          <p className="text-2xl font-bold">{orderCount}</p>
        </div>
      </div>
    </div>
  );
}
