<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Customer;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        $amount = 1000;

        $customer = Customer::create([
            'name' => 'John Doe', 
            'email' => 'john@example.com',
            'address' => [
                'line1' => '123 Street Name',
                'city' => 'Mumbai',
                'state' => 'MH',
                'postal_code' => '400001',
                'country' => 'IN',
            ],
        ]);

        $paymentIntent = PaymentIntent::create([
            'amount' => $amount,
            'currency' => 'inr',
            'description' => 'Order #1234 - iPhone purchase',
            'payment_method_types' => ['card'],
            'customer' => $customer->id,
        ]);

        return response()->json([
            'clientSecret' => $paymentIntent->client_secret,
        ]);
    }
}
