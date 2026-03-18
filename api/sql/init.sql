CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

INSERT INTO products (title, description, price, image_url)
SELECT * FROM (
  VALUES
    ('Classic Leather Backpack', 'Water-resistant commuter backpack with laptop sleeve.', 79.00, 'https://picsum.photos/id/1062/600/400'),
    ('Nordic Ceramic Mug', 'Hand-glazed mug for coffee and tea, 350ml.', 18.50, 'https://picsum.photos/id/30/600/400'),
    ('Wireless Desk Lamp', 'USB-C rechargeable lamp with 3 light temperatures.', 42.00, 'https://picsum.photos/id/180/600/400'),
    ('Minimal Running Shoes', 'Breathable knit upper with all-day comfort.', 98.99, 'https://picsum.photos/id/21/600/400'),
    ('Canvas Tote Bag', 'Heavyweight everyday tote with inner pocket.', 24.00, 'https://picsum.photos/id/292/600/400'),
    ('Noise-Cancel Earbuds', 'True wireless earbuds with 24h battery case.', 129.00, 'https://picsum.photos/id/1080/600/400')
) AS data(title, description, price, image_url)
WHERE NOT EXISTS (SELECT 1 FROM products);
