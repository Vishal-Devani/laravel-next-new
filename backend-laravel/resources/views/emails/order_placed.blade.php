<h2>Order Confirmation - Order #{{ $order->id }}</h2>

<p>Thank you for your order, {{ $order->user->name }}.</p>

<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th>Product</th>
      <th>Price</th>
      <th>Qty</th>
      <th>Subtotal</th>
    </tr>
  </thead>
  <tbody>
    @php
      $productGroups = [];
      $currentGroup = [];

      foreach ($metas as $meta) {
          $currentGroup[] = $meta;
          if ($meta->key === 'subtotal') {
              $grouped = collect($currentGroup)->keyBy('key');
              $productGroups[] = $grouped;
              $currentGroup = [];
          }
      }
    @endphp

    @foreach ($productGroups as $product)
      <tr>
        <td>{{ $product['product_name']->value ?? 'N/A' }}</td>
        <td>${{ number_format($product['price']->value ?? 0, 2) }}</td>
        <td>{{ $product['quantity']->value ?? 0 }}</td>
        <td>${{ number_format($product['subtotal']->value ?? 0, 2) }}</td>
      </tr>
    @endforeach
  </tbody>
</table>

<p><strong>Total:</strong> ${{ number_format($order->total, 2) }}</p>

<p>We’ll notify you once your order ships.</p>
