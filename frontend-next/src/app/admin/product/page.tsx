"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API from "@/app/utils/api";
import { useRouter } from "next/navigation";

// Define the product type
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  slug: string;
  description?: string;
  image?: string;
}

export default function AdminProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  // Fetch products on mount
  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Handle Delete product
  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");

    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await API.delete(`/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting product", error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Products</h1>
        <Link
          href="/admin/product/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Product
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Stock</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, index) => (
            <tr key={p.id}>
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">${p.price}</td>
              <td className="p-2 border">{p.stock}</td>
              <td className="p-2 border">
                <Link
                  href={`/products/${p.slug}`}
                  className="text-blue-600 hover:underline mr-3"
                >
                  View
                </Link>   
                <Link
                  href={`/admin/product/edit/${p.slug}`}
                  className="text-green-600 hover:underline mr-3"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
