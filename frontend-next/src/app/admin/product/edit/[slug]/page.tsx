"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import API from "@/app/utils/api";

export default function EditProductPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [serverError, setServerError] = useState("");
  
  useEffect(() => {
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

  const handleMainImageChange = (e: any) => {
    setMainImage(e.target.files[0]);
  };

  const handleGalleryChange = (e: any) => {
    const files = Array.from(e.target.files as FileList);
    setGalleryImages(files);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setServerError("");
    const token = localStorage.getItem("token");

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("price", formData.price);
    payload.append("stock", formData.stock);

    if (mainImage) {
      payload.append("image", mainImage);
    }

    galleryImages.forEach((file) => {
      payload.append("gallery[]", file);
    });

    try {
      await API.post(`/products/${slug}?_method=PUT`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/admin/product");
    } catch (err: any) {
      console.error("Error updating product:", err);
      setServerError("Failed to update product");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      {serverError && <p className="text-red-600 mb-4">{serverError}</p>}

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

          {/* Display main image if exists */}
          {product.image && (
            <div>
              <h3 className="text-xl font-medium">Current Main Image:</h3>
              <img
                src={`http://localhost:8000/storage/${product.image}`}
                alt="Main Product"
                className="w-32 h-32 object-cover mb-2"
              />
            </div>
          )}

          <div>
            <label className="block mb-1 font-medium">Replace Main Image</label>
            <input type="file" accept="image/*" onChange={handleMainImageChange} />
            {mainImage && (
              <img
                src={URL.createObjectURL(mainImage)}
                alt="Preview"
                className="w-32 h-32 object-cover mt-2"
              />
            )}
          </div>

          {/* Display gallery images if exists */}
          {product.gallery?.length > 0 && (
            <div>
              <h3 className="text-xl font-medium">Current Gallery Images:</h3>
              <div className="flex gap-4 mb-4">
                {product.gallery.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={`http://localhost:8000/storage/${image}`}
                    alt={`Gallery Image ${index + 1}`}
                    className="w-32 h-32 object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1 font-medium">Add More Gallery Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
            />
            {galleryImages.length > 0 && (
              <div className="flex gap-4 mt-2">
                {galleryImages.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`Gallery Image Preview ${index + 1}`}
                    className="w-32 h-32 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

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
