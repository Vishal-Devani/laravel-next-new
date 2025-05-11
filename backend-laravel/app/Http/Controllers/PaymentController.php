<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Customer;
use App\Models\UserAddress;
use App\Models\Cart;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        $user = auth()->user();

        $shipping = UserAddress::where('user_id', $user->id)
            ->where('address_type', 'shipping')
            ->first();

        if (!$shipping) {
            return response()->json(['error' => 'Shipping address not found.'], 422);
        }

        $cart = Cart::with('product')->where('user_id', $user->id)->get();

        if ($cart->isEmpty()) {
            return response()->json(['error' => 'Cart is empty.'], 400);
        }

        $totalAmount = $cart->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });

        $amountInPaise = $totalAmount * 100;

        $customer = Customer::create([
            'name' => $user->name, 
            'email' => $user->email,
            'address' => [
                'line1'       => $shipping->address_line1,
                'city'        => $shipping->city,
                'state'       => $shipping->state,
                'postal_code' => $shipping->postal_code,
                'country'     => $shipping->country,
            ],
        ]);

        $paymentIntent = PaymentIntent::create([
            'amount'               => round($amountInPaise),
            'currency'             => 'inr',
            'description'          => 'Order by ' . $user->email,
            'payment_method_types' => ['card'],
            'customer'             => $customer->id,
        ]);

        // ✅ Store payment in DB
        Payment::create([
            'user_id'     => $user->id,
            'payment_id'  => $paymentIntent->id,
            'customer_id' => $customer->id,
            'currency'    => 'inr',
            'amount'      => $totalAmount,
            'status'      => $paymentIntent->status,
            'description' => $paymentIntent->description,
            'metadata'    => json_encode($paymentIntent),
        ]);

        return response()->json([
            'clientSecret' => $paymentIntent->client_secret,
        ]);
    }
}   
