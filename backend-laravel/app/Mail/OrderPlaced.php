<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderPlaced extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $metas;

    public function __construct($order, $metas)
    {
        $this->order = $order;
        $this->metas = $metas;
    }

    public function build()
    {
        return $this->subject('Order Confirmation')
                    ->view('emails.order_placed');
    }
}

