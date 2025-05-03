<?php

namespace App\Http\Controllers;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $cartItems = Cart::with('product')
            ->where('user_id', $user->id)
            ->get();
    
        $cartTotal = $cartItems->sum('total');
    
        return response()->json([
            'items' => $cartItems,
            'total' => $cartTotal,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);
    
        $product = Product::findOrFail($request->product_id);
        $user = Auth::user();
    
        $cart = Cart::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();
    
        if ($cart) {
            $cart->quantity += $request->quantity;
            $cart->total = $cart->quantity * $cart->price;
            $cart->save();
        } else {
            Cart::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'price' => $product->price,
                'total' => $product->price * $request->quantity,
            ]);
        }
    
        return response()->json(['message' => 'Added to cart']);
    }

    public function destroy($id)
    {
        Cart::where('user_id', Auth::id())->where('id', $id)->delete();
        return response()->json(['message' => 'Item removed']);
    }
}

