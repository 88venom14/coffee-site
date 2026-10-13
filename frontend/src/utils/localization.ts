const categories: Record<string, string> = {
  accessories: 'Аксессуары',
  coffee: 'Кофе',
  'cold drinks': 'Холодные напитки',
  'cold-drinks': 'Холодные напитки',
  desserts: 'Десерты',
  pastries: 'Выпечка',
  tea: 'Чай',
};

const orderStatuses: Record<string, string> = {
  cancelled: 'Отменён',
  completed: 'Выполнен',
  pending: 'В обработке',
  placed: 'Принят',
  preparing: 'Готовится',
  ready: 'Готов',
};

export function localizeCategory(category: string): string {
  return categories[category.toLocaleLowerCase('ru-RU')] ?? category;
}

export function localizeOrderStatus(status: string): string {
  return orderStatuses[status.toLocaleLowerCase('ru-RU')] ?? status;
}

export function localizeOrderType(type: string): string {
  return type === 'pickup' ? 'Самовывоз' : 'Доставка';
}
