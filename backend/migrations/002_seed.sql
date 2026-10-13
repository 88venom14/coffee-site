INSERT INTO categories(name, slug) VALUES
  ('Кофе', 'coffee'),
  ('Чай', 'tea'),
  ('Холодные напитки', 'cold-drinks'),
  ('Выпечка', 'pastries'),
  ('Десерты', 'desserts'),
  ('Аксессуары', 'accessories')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO products(name, description, price, category_id, image_url, is_popular)
SELECT seed.name, seed.description, seed.price, categories.id, seed.image_url, seed.is_popular
FROM (VALUES
  ('Эспрессо', 'Крепкий насыщенный кофе с нотами тёмного шоколада и жареного миндаля.', 3.00, 'coffee', 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=900&q=85', true),
  ('Капучино', 'Двойной эспрессо, бархатистое молоко и нежная молочная пенка.', 4.50, 'coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=85', true),
  ('Медовый латте на овсяном молоке', 'Наш фирменный эспрессо с овсяным молоком и каплей местного мёда.', 5.50, 'coffee', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85', true),
  ('Флэт уайт', 'Насыщенный двойной ристретто с нежной микропеной.', 4.75, 'coffee', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=85', false),
  ('Американо', 'Эспрессо с горячей водой — чистый и сбалансированный вкус.', 3.75, 'coffee', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85', false),
  ('Тёмный мокко', 'Шоколад, эспрессо и горячее молоко с щепоткой какао.', 5.25, 'coffee', 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=85', true),
  ('Колд брю', 'Кофе холодного заваривания: настаиваем 16 часов для мягкого сладкого вкуса.', 5.00, 'cold-drinks', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=85', true),
  ('Матча-латте', 'Церемониальный зелёный чай, взбитый с молоком на ваш выбор.', 5.50, 'tea', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=85', false),
  ('Масала-чай', 'Чёрный чай с согревающими специями и молоком.', 4.75, 'tea', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=85', false),
  ('Сливочный круассан', 'Хрустящие золотистые слои, выпекаем каждое утро.', 3.75, 'pastries', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85', true),
  ('Булочка с корицей', 'Сдобная булочка с корицей и нежной ванильной глазурью.', 4.50, 'pastries', 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=85', false),
  ('Шоколадное печенье', 'Хрустящее снаружи, мягкое внутри и с кусочками тёмного шоколада.', 2.75, 'desserts', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=85', false),
  ('Баскский чизкейк', 'Нежный сливочный чизкейк с карамельной корочкой и ванильной серединой.', 6.00, 'desserts', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=85', true),
  ('Кофе в зёрнах', 'Пачка сезонной смеси для эспрессо, 250 г.', 16.00, 'accessories', 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=900&q=85', false)
) AS seed(name, description, price, category_slug, image_url, is_popular)
JOIN categories ON categories.slug = seed.category_slug
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE products.name = seed.name
)
AND NOT EXISTS (
  SELECT 1 FROM products WHERE products.name = CASE seed.name
    WHEN 'Эспрессо' THEN 'Espresso'
    WHEN 'Капучино' THEN 'Cappuccino'
    WHEN 'Медовый латте на овсяном молоке' THEN 'Honey Oat Latte'
    WHEN 'Флэт уайт' THEN 'Flat White'
    WHEN 'Американо' THEN 'Americano'
    WHEN 'Тёмный мокко' THEN 'Dark Mocha'
    WHEN 'Колд брю' THEN 'Slow Cold Brew'
    WHEN 'Матча-латте' THEN 'Matcha Latte'
    WHEN 'Масала-чай' THEN 'Masala Chai'
    WHEN 'Сливочный круассан' THEN 'Butter Croissant'
    WHEN 'Булочка с корицей' THEN 'Cinnamon Roll'
    WHEN 'Шоколадное печенье' THEN 'Chocolate Cookie'
    WHEN 'Баскский чизкейк' THEN 'Basque Cheesecake'
    WHEN 'Кофе в зёрнах' THEN 'House Coffee Beans'
  END
);
