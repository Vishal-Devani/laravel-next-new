<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AdminDashboardController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Protected routes (need login)
Route::middleware('auth:sanctum')->group(function () {

    //Admin API
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'getDashboardData']);
    Route::get('/admin/orders', [OrderController::class, 'getAllOrders']);
    Route::get('/admin/orders/{id}', [OrderController::class, 'getOrderDetails']);

    //User API
    Route::post('/logout', [AuthController::class, 'logout']);
    //Route::post('/profile/update', [AuthController::class, 'update']); 
    Route::get('/profile', [AuthController::class, 'profile']); 
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);

    // Product API
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{slug}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    //Cart API
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);

    //Payment API
    Route::post('/create-payment-intent', [PaymentController::class, 'createPaymentIntent']);

    //Order API
    Route::post('/place-order',  [OrderController::class, 'store']);

});


