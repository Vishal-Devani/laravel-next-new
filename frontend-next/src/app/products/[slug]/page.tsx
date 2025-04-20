// app/products/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "@/app/utils/api";

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    API.get(`/products/${slug}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError("Product not found"));
  }, [slug]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="text-gray-700 mb-4">{product.description}</p>
      <p className="font-semibold">Price: ${product.price}</p>
    </div>
  );
}
