'use client';

import { useEffect, useState, use } from 'react';
import API from '@/app/utils/api';

interface OrderMeta {
  key: string;
  value: string;
}

interface Payment {
  status: string;
  method: string;
  amount: number;
  created_at: string;
}

interface Address {
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Order {
  id: number;
  user: {
    name: string;
    email: string;
  };
  metas: OrderMeta[];
  payment: Payment;
  total: number;
}

export default function OrderDetails({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      const token = localStorage.getItem('token');
      const response = await API.get(`/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrder(response.data);
    }

    fetchOrderDetails();
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  // Parse billing and shipping from metas
  const billingMeta = order.metas.find(m => m.key === 'billing_address');
  const shippingMeta = order.metas.find(m => m.key === 'shipping_address');

  const billing: Address | null = billingMeta ? JSON.parse(billingMeta.value) : null;
  const shipping: Address | null = shippingMeta ? JSON.parse(shippingMeta.value) : null;

  const items = [];

  for (let i = 0; i < order.metas.length; i += 5) {
    const group = order.metas.slice(i, i + 5);
    const name = group.find((m) => m.key === 'product_name')?.value;
    const quantity = group.find((m) => m.key === 'quantity')?.value;
    const price = group.find((m) => m.key === 'price')?.value;

    if (name && quantity && price) {
      items.push({ name, quantity, price });
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Order Details - #{order.id}</h1>

      {/* User Info */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-medium mb-2">User Information</h2>
        <p>Name: {order.user.name}</p>
        <p>Email: {order.user.email}</p>
      </div>

      {/* Billing & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-medium mb-2">Billing Address</h2>
          {billing ? (
            <>
              <p>{billing.address_line1}</p>
              <p>{billing.city}, {billing.state}</p>
              <p>{billing.country} - {billing.postal_code}</p>
            </>
          ) : <p>Not available</p>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-medium mb-2">Shipping Address</h2>
          {shipping ? (
            <>
              <p>{shipping.address_line1}</p>
              <p>{shipping.city}, {shipping.state}</p>
              <p>{shipping.country} - {shipping.postal_code}</p>
            </>
          ) : <p>Not available</p>}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
        <h2 className="text-xl font-medium mb-2">Order Items</h2>
        <ul className="list-disc pl-4 space-y-2">
          {items.map((item, index) => (
            <li key={index}>
              <strong>{item.name}</strong> — {item.quantity} × ₹{item.price}
            </li>
          ))}
        </ul>
      </div>

      {/* Payment Info */}
      <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
        <h2 className="text-xl font-medium mb-2">Payment Information</h2>
        <p>Status: {order.payment?.status || 'N/A'}</p>
        <p>Method: {order.payment?.method || 'N/A'}</p>
        <p>Amount: ₹{order.payment?.amount}</p>
        <p>Paid On: {order.payment?.created_at}</p>
      </div>
    </div>
  );
}
