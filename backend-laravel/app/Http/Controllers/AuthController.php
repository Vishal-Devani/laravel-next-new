<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        return response()->json(['message' => 'User registered successfully']);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);


        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $request->user()->createToken('auth-token')->plainTextToken;
        //dd(Auth::user());

        return response()->json(['token' => $token, 'user' => Auth::user()]);
    }

    // public function update(Request $request)
    // {
    //     $user = $request->user();

    //     $request->validate([
    //         'name' => 'required|string|max:255',
    //         'email' => 'required|email|unique:users,email,' . $user->id,
    //     ]);

    //     $user->update([
    //         'name' => $request->name,
    //         'email' => $request->email,
    //     ]);

    //     return response()->json(['user' => $user]);
    // }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function profile(Request $request)
    {
        $user = $request->user();

        $billing = $user->addresses()->where('address_type', 'billing')->first();
        $shipping = $user->addresses()->where('address_type', 'shipping')->first();

        return response()->json([
            'user' => $user,
            'billing' => $billing,
            'shipping' => $shipping,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
    
            'billing.address_line1' => 'required|string|max:255',
            'billing.city' => 'required|string|max:100',
            'billing.state' => 'required|string|max:100',
            'billing.country' => 'required|string|max:100',
            'billing.postal_code' => 'required|string|max:20',
    
            'shipping.address_line1' => 'required|string|max:255',
            'shipping.city' => 'required|string|max:100',
            'shipping.state' => 'required|string|max:100',
            'shipping.country' => 'required|string|max:100',
            'shipping.postal_code' => 'required|string|max:20',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'profile_update' => 1,
        ]);

        foreach (['billing', 'shipping'] as $type) {
            if ($request->has($type)) {
                $data = $request[$type];
                $user->addresses()->updateOrCreate(
                    ['address_type' => $type],
                    array_merge($data, ['address_type' => $type])
                );
            }
        }

        return response()->json(['message' => 'Profile updated successfully']);
    }

}
