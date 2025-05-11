<?php 

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function getDashboardData()
    {
        $userCount = User::count();
        $orderCount = Order::count();

        return response()->json([
            'userCount' => $userCount,
            'orderCount' => $orderCount,
        ]);
    }
}
