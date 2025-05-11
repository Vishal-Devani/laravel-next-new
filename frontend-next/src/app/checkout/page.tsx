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
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [billing, setBilling] = useState<any>(null);
  const [shipping, setShipping] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const initCheckout = async () => {
      try {
        const [cartRes, profileRes, paymentRes] = await Promise.all([
          API.get("/cart", { headers: { Authorization: `Bearer ${token}` } }),
          API.get("/profile", { headers: { Authorization: `Bearer ${token}` } }),
          API.post("/create-payment-intent", {}, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const items = cartRes.data.items || [];
        setCartItems(items);

        const calculatedTotal = items.reduce(
          (acc: number, item: any) => acc + item.quantity * parseFloat(item.product.price),
          0
        );
        setTotal(calculatedTotal);

        setBilling(profileRes.data.billing);
        setShipping(profileRes.data.shipping);
        setClientSecret(paymentRes.data.clientSecret);
      } catch (err) {
        console.error("Checkout error", err);
        setErrorMessage("Failed to initialize checkout. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMessage("");

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) {
      setErrorMessage("Card details are not entered.");
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      setErrorMessage(result.error.message || "Payment failed.");
    } else if (result.paymentIntent.status === "succeeded") {
      const token = localStorage.getItem("token");
    
      await API.post(
        "/place-order",
        {
          payment_id: result.paymentIntent.id,
          billing,
          shipping,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    
      router.push("/checkout/thank-you");
    }    
  };

  const renderAddress = (title: string, address: any) => (
    <div className="mt-4 text-sm text-gray-700">
      <h3 className="font-semibold text-md mb-1">{title}</h3>
      <p>{address.address_line1}</p>
      {address.address_line2 && <p>{address.address_line2}</p>}
      <p>{address.city}, {address.state}</p>
      <p>{address.country} - {address.postal_code}</p>
    </div>
  );

  if (loading) {
    return <div className="p-6 text-center text-lg">Loading checkout...</div>;
  }

  if (!cartItems.length) {
    return <div className="p-6 text-center text-lg text-gray-700">Your cart is empty.</div>;
  }

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

        {billing && renderAddress("Billing Address", billing)}
        {shipping && renderAddress("Shipping Address", shipping)}
      </div>

      {/* Right Side: Payment Form */}
      <div className="md:w-1/2 border rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

        {clientSecret ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <CardElement className="border p-3 rounded" />
            <button
              type="submit"
              disabled={!stripe}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Pay Now
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-600">Unable to load payment form.</p>
        )}

        {errorMessage && (
          <div className="mt-4 text-red-600 font-medium">{errorMessage}</div>
        )}
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
