UPDATE categories
SET name = CASE slug
  WHEN 'coffee' THEN 'Кофе'
  WHEN 'tea' THEN 'Чай'
  WHEN 'cold-drinks' THEN 'Холодные напитки'
  WHEN 'pastries' THEN 'Выпечка'
  WHEN 'desserts' THEN 'Десерты'
  WHEN 'accessories' THEN 'Аксессуары'
  ELSE name
END
WHERE slug IN ('coffee', 'tea', 'cold-drinks', 'pastries', 'desserts', 'accessories');

UPDATE products SET name = 'Эспрессо', description = 'Крепкий насыщенный кофе с нотами тёмного шоколада и жареного миндаля.' WHERE name = 'Espresso';
UPDATE products SET name = 'Капучино', description = 'Двойной эспрессо, бархатистое молоко и нежная молочная пенка.' WHERE name = 'Cappuccino';
UPDATE products SET name = 'Медовый латте на овсяном молоке', description = 'Наш фирменный эспрессо с овсяным молоком и каплей местного мёда.' WHERE name = 'Honey Oat Latte';
UPDATE products SET name = 'Флэт уайт', description = 'Насыщенный двойной ристретто с нежной микропеной.' WHERE name = 'Flat White';
UPDATE products SET name = 'Американо', description = 'Эспрессо с горячей водой — чистый и сбалансированный вкус.' WHERE name = 'Americano';
UPDATE products SET name = 'Тёмный мокко', description = 'Шоколад, эспрессо и горячее молоко с щепоткой какао.' WHERE name = 'Dark Mocha';
UPDATE products SET name = 'Колд брю', description = 'Кофе холодного заваривания: настаиваем 16 часов для мягкого сладкого вкуса.' WHERE name = 'Slow Cold Brew';
UPDATE products SET name = 'Матча-латте', description = 'Церемониальный зелёный чай, взбитый с молоком на ваш выбор.' WHERE name = 'Matcha Latte';
UPDATE products SET name = 'Масала-чай', description = 'Чёрный чай с согревающими специями и молоком.' WHERE name = 'Masala Chai';
UPDATE products SET name = 'Сливочный круассан', description = 'Хрустящие золотистые слои, выпекаем каждое утро.' WHERE name = 'Butter Croissant';
UPDATE products SET name = 'Булочка с корицей', description = 'Сдобная булочка с корицей и нежной ванильной глазурью.' WHERE name = 'Cinnamon Roll';
UPDATE products SET name = 'Шоколадное печенье', description = 'Хрустящее снаружи, мягкое внутри и с кусочками тёмного шоколада.' WHERE name = 'Chocolate Cookie';
UPDATE products SET name = 'Баскский чизкейк', description = 'Нежный сливочный чизкейк с карамельной корочкой и ванильной серединой.' WHERE name = 'Basque Cheesecake';
UPDATE products SET name = 'Кофе в зёрнах', description = 'Пачка сезонной смеси для эспрессо, 250 г.' WHERE name = 'House Coffee Beans';
