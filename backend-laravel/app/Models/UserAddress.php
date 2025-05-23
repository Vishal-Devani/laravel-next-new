<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'address_type', 'address_line1', 'address_line2',
        'city', 'state', 'postal_code', 'country'
    ];
}

