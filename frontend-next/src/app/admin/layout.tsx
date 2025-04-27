"use client";

import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decrypt } from "@/app/utils/crypto";
import useAdminAuth from "@/app/hooks/useAdminAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  if (loading) return; //<p>Loading...</p>;
  if (!user) return null; 

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <ul className="space-y-3">
         <li>
            <Link href="/admin/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
          </li>
          <li>
            <Link href="/admin/product" className="text-blue-600 hover:underline">Product</Link>
          </li>
          <li>
            <Link href="/admin/profile" className="text-blue-600 hover:underline">Profile</Link>
          </li>
          <li>
            <Link href="/admin/change-password" className="text-blue-600 hover:underline">Change Password</Link>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-white">
        {children}
      </main>
    </div>
  );
}
