<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    protected $fillable = [
        'order_id', 'to_email', 'subject', 'body', 'status',
    ];
}
