-- Seed data: 10 sample products. Safe to re-run (skips if products exist).
INSERT INTO products (name, description, price, stock, category, image_url)
SELECT * FROM (VALUES
  ('Aurora Wireless Headphones', 'Over-ear wireless headphones with active noise cancellation and 40-hour battery life.', 129.99, 45, 'Electronics', 'https://placehold.co/600x600/1e293b/white?text=Aurora+Headphones'),
  ('Nimbus Smart Watch', 'Fitness tracking, heart-rate monitoring, and 7-day battery in a slim aluminum case.', 89.50, 60, 'Electronics', 'https://placehold.co/600x600/1e293b/white?text=Nimbus+Watch'),
  ('Cascade Pour-Over Kettle', 'Gooseneck electric kettle with precision temperature control for pour-over coffee.', 64.00, 30, 'Home & Kitchen', 'https://placehold.co/600x600/1e293b/white?text=Cascade+Kettle'),
  ('Terra Ceramic Mug Set', 'Set of four hand-glazed stoneware mugs in earthy tones. Dishwasher safe.', 38.00, 80, 'Home & Kitchen', 'https://placehold.co/600x600/1e293b/white?text=Terra+Mugs'),
  ('Summit Daypack 22L', 'Lightweight water-resistant daypack with laptop sleeve and ventilated back panel.', 74.25, 50, 'Outdoors', 'https://placehold.co/600x600/1e293b/white?text=Summit+Daypack'),
  ('Ridge Titanium Spork', 'Ultralight titanium spork for camping and backpacking. Weighs 19g.', 12.99, 150, 'Outdoors', 'https://placehold.co/600x600/1e293b/white?text=Titanium+Spork'),
  ('Lumen Desk Lamp', 'LED desk lamp with wireless charging base and adjustable color temperature.', 54.90, 40, 'Furniture', 'https://placehold.co/600x600/1e293b/white?text=Lumen+Lamp'),
  ('Willow Linen Throw', '100% washed linen throw blanket, 130x170cm, stonewashed for softness.', 59.00, 25, 'Home & Kitchen', 'https://placehold.co/600x600/1e293b/white?text=Willow+Throw'),
  ('Pulse Yoga Mat 6mm', 'Non-slip TPE yoga mat with alignment lines and carry strap.', 32.00, 70, 'Sports & Fitness', 'https://placehold.co/600x600/1e293b/white?text=Pulse+Yoga+Mat'),
  ('Vertex Mechanical Keyboard', '75% hot-swappable mechanical keyboard with gasket mount and RGB backlight.', 109.00, 35, 'Electronics', 'https://placehold.co/600x600/1e293b/white?text=Vertex+Keyboard')
) AS seed(name, description, price, stock, category, image_url)
WHERE NOT EXISTS (SELECT 1 FROM products);
