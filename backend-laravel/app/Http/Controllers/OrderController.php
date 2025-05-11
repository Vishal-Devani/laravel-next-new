<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Order;
use App\Models\EmailLog;
use App\Mail\OrderPlaced;
use App\Models\Payment;

use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    public function getAllOrders(Request $request)
    {
        $orders = Order::with('user')->latest()->get();
        return response()->json($orders);
    }

    public function getOrderDetails($id)
    {
        $order = Order::with(['user', 'metas', 'payment'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $cart = Cart::with('product')->where('user_id', $user->id)->get();

        if ($cart->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        $total = $cart->sum(fn ($item) => $item->quantity * $item->product->price);

        $order = Order::create([
            'user_id'    => $user->id,
            'total'      => $total,
            'payment_id' => $request->payment_id,
            'status'     => 'paid',
        ]);

        Payment::where('payment_id', $request->payment_id)->update([
            'order_id' => $order->id,
        ]);

        foreach ($cart as $item) {
            $order->metas()->createMany([
                ['key' => 'product_id', 'value' => $item->product_id],
                ['key' => 'product_name', 'value' => $item->product->name],
                ['key' => 'price', 'value' => $item->product->price],
                ['key' => 'quantity', 'value' => $item->quantity],
                ['key' => 'subtotal', 'value' => $item->quantity * $item->product->price],
            ]);
        }

        $order->metas()->createMany([
            ['key' => 'billing_address', 'value' => json_encode($request->billing)],
            ['key' => 'shipping_address', 'value' => json_encode($request->shipping)],
        ]);

        $metas = $order->metas;

        // Send to user
        //Mail::to($user->email)->send(new OrderPlaced($order, $order->metas));
        EmailLog::create([
            'order_id' => $order->id,
            'to_email' => $user->email,
            'subject' => 'Order Confirmation - Order #' . $order->id,
            'body' => view('emails.order_placed', ['order' => $order, 'metas' => $metas])->render(),
            'status' => 'sent',
        ]);
        
        // Send to admin
        //Mail::to('vishudev9@gmail.com')->send(new OrderPlaced($order, $order->metas));
        EmailLog::create([
            'order_id' => $order->id,
            'to_email' => 'vishudev9@gmail.com',
            'subject' => 'New Order Received - Order #' . $order->id,
            'body' => view('emails.order_placed', ['order' => $order, 'metas' => $metas])->render(),
            'status' => 'sent',
        ]);
        
        Cart::where('user_id', $user->id)->delete();
        return response()->json(['message' => 'Order placed', 'order_id' => $order->id]);
    }

}
