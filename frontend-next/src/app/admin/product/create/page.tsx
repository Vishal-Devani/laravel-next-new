"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/app/utils/api";

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const [serverError, setServerError] = useState("");
  const onlyDigits = (str: string) => /^\d+(\.\d{1,2})?$/.test(str);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Required";
        break;
      case "price":
        if (!value) return "Required";
        if (!onlyDigits(value)) return "Invalid price";
        if (isNaN(Number(value)) || Number(value) <= 0) return "Price must be a positive number";
        break;
      case "stock":
        if (!value) return "Required";
        if (!/^\d+$/.test(value)) return "Invalid stock";
        if (isNaN(Number(value)) || Number(value) < 0) return "Stock must be a positive number";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e: any) => {
    setMainImage(e.target.files[0]);
  };

  const handleGalleryChange = (e: any) => {
    setGalleryImages([...e.target.files]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setServerError("");

    const newErrors: any = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, (formData as any)[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const token = localStorage.getItem("token");
    const payload = new FormData();

    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("price", formData.price);
    payload.append("stock", formData.stock);

    if (mainImage) {
      payload.append("image", mainImage);
    }

    galleryImages.forEach((file, index) => {
      payload.append(`gallery[]`, file);
    });

    try {
      await API.post("/products", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/admin/product");
    } catch (err: any) {
      if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError("Something went wrong!");
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>

      {serverError && <p className="text-red-600 mb-4">{serverError}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <input
            name="name"
            placeholder="Product Name"
            onChange={handleChange}
            value={formData.name}
            className={`w-full border p-2 rounded ${errors.name ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            value={formData.description}
            className="w-full border p-2 rounded"
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        <div>
          <input
            type="text"
            name="price"
            placeholder="Price"
            onChange={handleChange}
            value={formData.price}
            className={`w-full border p-2 rounded ${errors.price ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>

        <div>
          <input
            type="text"
            name="stock"
            placeholder="Stock"
            onChange={handleChange}
            value={formData.stock}
            className={`w-full border p-2 rounded ${errors.stock ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Main Image</label>
          <input type="file" accept="image/*" onChange={handleMainImageChange} />
        </div>

        <div>
          <label className="block mb-1 font-medium">Gallery Images</label>
          <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Product
        </button>
      </form>
    </div>
  );
}
