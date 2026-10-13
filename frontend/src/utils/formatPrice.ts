export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
