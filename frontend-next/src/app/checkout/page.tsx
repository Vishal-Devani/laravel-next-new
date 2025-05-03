"use client";

import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/app/utils/api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const initCheckout = async () => {
      try {
        const cartRes = await API.get("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        const items = cartRes.data.items; // ✅ Access the actual array
        setCartItems(items);
    
        const calculatedTotal = items.reduce(
          (acc: number, item: any) => acc + item.quantity * parseFloat(item.product.price),
          0
        );
        setTotal(calculatedTotal);
    
        const paymentRes = await API.post("/create-payment-intent", {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        setClientSecret(paymentRes.data.clientSecret);
      } catch (err) {
        console.error("Checkout error", err);
      }
    };    

    initCheckout();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      console.error(result.error.message);
    } else {
      if (result.paymentIntent.status === "succeeded") {
        router.push("/checkout/thank-you");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 max-w-5xl mx-auto">
      {/* Left Side: Cart Summary */}
      <div className="md:w-1/2 border rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-4">Cart Summary</h2>
        {cartItems.map((item: any) => (
          <div key={item.id} className="flex justify-between border-b py-2">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            <p>${(item.quantity * item.product.price).toFixed(2)}</p>
          </div>
        ))}
        <div className="mt-4 text-right font-bold text-lg">
          Total: ${total.toFixed(2)}
        </div>
      </div>

      {/* Right Side: Payment Form */}
      <div className="md:w-1/2 border rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CardElement className="border p-3 rounded" />
          <button
            type="submit"
            disabled={!stripe || !clientSecret}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
