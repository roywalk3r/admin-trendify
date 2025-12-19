double computeCouponDiscount(Map<String, dynamic>? coupon, double subtotal) {
  if (coupon == null || subtotal <= 0) return 0.0;

  final type = coupon['type'] as String?;
  final value = (coupon['value'] as num?)?.toDouble();
  final maxDiscount = (coupon['maxDiscount'] as num?)?.toDouble();
  final minPurchase = (coupon['minPurchase'] as num?)?.toDouble();

  if (value == null) return 0.0;
  if (minPurchase != null && subtotal < minPurchase) return 0.0;

  double discount;
  if (type == 'percentage') {
    discount = subtotal * value / 100;
    if (maxDiscount != null && discount > maxDiscount) {
      discount = maxDiscount;
    }
  } else {
    discount = value;
  }

  if (discount > subtotal) return subtotal;
  return discount;
}
