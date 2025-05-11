<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderMeta extends Model
{
    use HasFactory;
    protected $table = 'order_meta';
    protected $fillable = ['order_id', 'key', 'value'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

