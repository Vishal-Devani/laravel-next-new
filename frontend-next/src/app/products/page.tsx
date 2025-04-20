// app/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API from "@/app/utils/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    API.get("/products")
    .then((res) => setProducts(res.data))
    .catch((err) => console.error("Failed to fetch products", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Products test</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="p-4 border rounded hover:shadow"
          >
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p>{product.description?.slice(0, 80)}...</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
