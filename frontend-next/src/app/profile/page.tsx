"use client";

import { useEffect, useState } from "react";
import API from "@/app/utils/api";

type UserType = {
  name: string;
  email: string;
};

type AddressType = {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

type ValidationErrors = Record<string, string[]>;

export default function ProfilePage() {
  const [user, setUser] = useState<UserType>({ name: "", email: "" });
  const [billing, setBilling] = useState<AddressType>({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: ""
  });
  const [shipping, setShipping] = useState<AddressType>({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: ""
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await API.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser({
        name: res.data.user.name || "",
        email: res.data.user.email || "",
      });

      setBilling({
        address_line1: res.data.billing?.address_line1 || "",
        address_line2: res.data.billing?.address_line2 || "",
        city: res.data.billing?.city || "",
        state: res.data.billing?.state || "",
        postal_code: res.data.billing?.postal_code || "",
        country: res.data.billing?.country || "",
      });

      setShipping({
        address_line1: res.data.shipping?.address_line1 || "",
        address_line2: res.data.shipping?.address_line2 || "",
        city: res.data.shipping?.city || "",
        state: res.data.shipping?.state || "",
        postal_code: res.data.shipping?.postal_code || "",
        country: res.data.shipping?.country || "",
      });

    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: "user" | "billing" | "shipping"
  ) => {
    const { name, value } = e.target;
    if (section === "user") {
      setUser((prev) => ({ ...prev, [name]: value }));
    } else if (section === "billing") {
      setBilling((prev) => ({ ...prev, [name]: value }));
    } else {
      setShipping((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const token = localStorage.getItem("token");

    try {
      await API.post(
        "/profile/update",
        {
          name: user.name,
          email: user.email,
          billing,
          shipping,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchProfile();
      alert("Profile updated!");
    } catch (err: any) {
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        console.error("Unknown error", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    name: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder: string,
    errorKey: string
  ) => (
    <div className="mb-3">
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded"
      />
      {errors[errorKey] && (
        <div className="text-sm text-red-500 mt-1">
          {errors[errorKey].map((msg, idx) => (
            <p key={idx}>{msg}</p>
          ))}
        </div>
      )}
    </div>
  );

  if (loadingProfile) {
    return <div className="text-center p-6">Loading profile...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile Information</h1>

      {renderInput("name", user.name, (e) => handleChange(e, "user"), "Name", "name")}
      {renderInput("email", user.email, (e) => handleChange(e, "user"), "Email", "email")}

      <div>
        <h2 className="text-xl font-semibold mt-6">Billing Address</h2>
        {renderInput("address_line1", billing.address_line1, (e) => handleChange(e, "billing"), "Address Line 1", "billing.address_line1")}
        {renderInput("address_line2", billing.address_line2 || "", (e) => handleChange(e, "billing"), "Address Line 2", "billing.address_line2")}
        {renderInput("city", billing.city, (e) => handleChange(e, "billing"), "City", "billing.city")}
        {renderInput("state", billing.state, (e) => handleChange(e, "billing"), "State", "billing.state")}
        {renderInput("country", billing.country, (e) => handleChange(e, "billing"), "Country", "billing.country")}
        {renderInput("postal_code", billing.postal_code, (e) => handleChange(e, "billing"), "Postal Code", "billing.postal_code")}
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6">Shipping Address</h2>
        {renderInput("address_line1", shipping.address_line1, (e) => handleChange(e, "shipping"), "Address Line 1", "shipping.address_line1")}
        {renderInput("address_line2", shipping.address_line2 || "", (e) => handleChange(e, "shipping"), "Address Line 2", "shipping.address_line2")}
        {renderInput("city", shipping.city, (e) => handleChange(e, "shipping"), "City", "shipping.city")}
        {renderInput("state", shipping.state, (e) => handleChange(e, "shipping"), "State", "shipping.state")}
        {renderInput("country", shipping.country, (e) => handleChange(e, "shipping"), "Country", "shipping.country")}
        {renderInput("postal_code", shipping.postal_code, (e) => handleChange(e, "shipping"), "Postal Code", "shipping.postal_code")}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
