// app/admin/product/edit/[slug].tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/app/utils/api";
import { useParams } from "next/navigation";

export default function EditProductPage() {
    const { slug } = useParams(); // Retrieve the 'slug' from the URL
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    });

    useEffect(() => {
    // Fetch the product data based on the slug
    if (slug) {
        API.get(`/products/${slug}`)
        .then((res) => {
            setProduct(res.data);
            setFormData({
            name: res.data.name,
            description: res.data.description,
            price: res.data.price,
            stock: res.data.stock,
            });
        })
        .catch((err) => console.error("Error fetching product:", err));
    }
    }, [slug]);

    const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const slug = product.slug;

        try {
            await API.put(`/products/${slug}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            router.push("/admin/product");
        } catch (err) {
            console.error("Error updating product:", err);
        }
    };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      {product ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Product Name"
            onChange={handleChange}
            value={formData.name}
            className="w-full border p-2 rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            value={formData.description}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="price"
            placeholder="Price"
            onChange={handleChange}
            value={formData.price}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            name="stock"
            placeholder="Stock"
            onChange={handleChange}
            value={formData.stock}
            className="w-full border p-2 rounded"
            required
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save Changes
          </button>
        </form>
      ) : (
        <p>Loading product...</p>
      )}
    </div>
  );
}
