-- Idempotent seed data. Runs on every startup (spring.sql.init.mode=always);
-- each row is inserted only when it does not already exist.

INSERT INTO category (name)
SELECT v.name
FROM (VALUES ('Starters'), ('Mains'), ('Desserts'), ('Drinks')) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM category c WHERE c.name = v.name);

INSERT INTO menu_item (category_id, name, description, price, available)
SELECT c.id, v.name, v.description, v.price, v.available
FROM (VALUES
        ('Starters', 'Garlic Bread',        'Toasted ciabatta with garlic butter and herbs',        4.50, true),
        ('Starters', 'Soup of the Day',      'Chef''s daily soup served with crusty bread',          5.25, true),
        ('Starters', 'Bruschetta',           'Grilled bread topped with tomato, basil and olive oil', 5.75, true),
        ('Mains',    'Margherita Pizza',     'Tomato, mozzarella and fresh basil',                   9.50, true),
        ('Mains',    'Spaghetti Bolognese',  'Slow-cooked beef ragu with parmesan',                 11.00, true),
        ('Mains',    'Grilled Salmon',       'Salmon fillet with seasonal vegetables',              14.75, true),
        ('Mains',    'Veggie Burger',        'Plant-based patty, lettuce, tomato and fries',        10.25, false),
        ('Desserts', 'Tiramisu',             'Classic coffee-soaked mascarpone dessert',             6.00, true),
        ('Desserts', 'Chocolate Brownie',    'Warm brownie with vanilla ice cream',                  5.50, true),
        ('Drinks',   'Still Water',          '500ml bottle',                                         1.50, true),
        ('Drinks',   'Fresh Orange Juice',   'Freshly squeezed',                                     3.00, true),
        ('Drinks',   'Cappuccino',           'Double-shot with steamed milk',                        2.75, true)
     ) AS v(category, name, description, price, available)
JOIN category c ON c.name = v.category
WHERE NOT EXISTS (
        SELECT 1 FROM menu_item m WHERE m.name = v.name AND m.category_id = c.id);
