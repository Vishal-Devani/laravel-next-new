<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'image',
    ];

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
}
