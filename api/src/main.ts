import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import { randomBytes, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

dotenv.config({ path: 'api/.env' });

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:4200';
const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://app_user:app_password@localhost:5432/ecommerce';
const sessionHours = Number(process.env.SESSION_TTL_HOURS ?? '24');

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = randomBytes(32).toString('hex');
}

const pool = new Pool({ connectionString: databaseUrl });

const app = express();
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

type SafeUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
};

type AuthedRequest = Request & {
  currentUser?: SafeUser;
  accessToken?: string;
};

const schemaSql = `
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
`;

const seedSql = `
INSERT INTO products (id, title, description, price, image_url)
VALUES
  (1, 'Classic Leather Backpack', 'Water-resistant commuter backpack with a padded laptop sleeve and front organizer pocket.', 79.00, 'https://picsum.photos/seed/classic-leather-backpack/600/400'),
  (2, 'Nordic Ceramic Mug', 'Stoneware mug with a matte glaze finish sized for coffee, tea, or cocoa.', 18.50, 'https://picsum.photos/seed/nordic-ceramic-mug/600/400'),
  (3, 'Wireless Desk Lamp', 'Rechargeable desk lamp with three color temperatures and touch brightness control.', 42.00, 'https://picsum.photos/seed/wireless-desk-lamp/600/400'),
  (4, 'Minimal Running Shoes', 'Lightweight trainers built with a breathable knit upper and cushioned sole.', 98.99, 'https://picsum.photos/seed/minimal-running-shoes/600/400'),
  (5, 'Canvas Tote Bag', 'Heavyweight carryall with reinforced handles and an inner essentials pocket.', 24.00, 'https://picsum.photos/seed/canvas-tote-bag/600/400'),
  (6, 'Noise-Cancel Earbuds', 'Compact true wireless earbuds with active noise canceling and a charging case.', 129.00, 'https://picsum.photos/seed/noise-cancel-earbuds/600/400'),
  (7, 'Linen Desk Organizer', 'Desktop organizer with divided compartments for notes, pens, and charging cables.', 31.00, 'https://picsum.photos/seed/linen-desk-organizer/600/400'),
  (8, 'Stainless Water Bottle', 'Double-wall insulated bottle that keeps drinks cold for hours.', 27.50, 'https://picsum.photos/seed/stainless-water-bottle/600/400'),
  (9, 'Wool Throw Blanket', 'Soft woven blanket made for couches, reading chairs, and cool evenings.', 64.00, 'https://picsum.photos/seed/wool-throw-blanket/600/400'),
  (10, 'Travel Duffel Bag', 'Weekend duffel with shoe compartment, shoulder strap, and easy-access pockets.', 86.00, 'https://picsum.photos/seed/travel-duffel-bag/600/400'),
  (11, 'Espresso Bean Grinder', 'Burr grinder with precise settings for espresso, drip, and French press.', 112.00, 'https://picsum.photos/seed/espresso-bean-grinder/600/400'),
  (12, 'Smart Fitness Watch', 'Everyday smartwatch with workout tracking, sleep insights, and message alerts.', 149.00, 'https://picsum.photos/seed/smart-fitness-watch/600/400'),
  (13, 'Bamboo Cutting Board', 'Durable prep board with juice groove and a reversible chopping surface.', 29.00, 'https://picsum.photos/seed/bamboo-cutting-board/600/400'),
  (14, 'Portable Bluetooth Speaker', 'Small-room speaker with balanced sound, long battery life, and USB-C charging.', 74.00, 'https://picsum.photos/seed/portable-bluetooth-speaker/600/400'),
  (15, 'Everyday Denim Jacket', 'Classic fit jacket with soft-wash denim and layered-season versatility.', 89.00, 'https://picsum.photos/seed/everyday-denim-jacket/600/400'),
  (16, 'Adjustable Office Chair', 'Supportive desk chair with breathable mesh back and adjustable armrests.', 189.00, 'https://picsum.photos/seed/adjustable-office-chair/600/400'),
  (17, 'Glass Meal Prep Set', 'Stackable food containers with snap lids for weekly prep and storage.', 36.00, 'https://picsum.photos/seed/glass-meal-prep-set/600/400'),
  (18, 'Trail Hiking Boots', 'Rugged mid-height boots with grippy outsoles for uneven terrain.', 138.00, 'https://picsum.photos/seed/trail-hiking-boots/600/400'),
  (19, 'Cotton Bath Towel Set', 'Absorbent towel set woven from plush cotton for everyday bathroom use.', 48.00, 'https://picsum.photos/seed/cotton-bath-towel-set/600/400'),
  (20, 'Compact Air Purifier', 'Small-space purifier with replaceable filters and quiet night mode.', 119.00, 'https://picsum.photos/seed/compact-air-purifier/600/400'),
  (21, 'Mechanical Keyboard', 'Tactile keyboard with hot-swappable switches and a compact layout.', 104.00, 'https://picsum.photos/seed/mechanical-keyboard/600/400'),
  (22, 'Ceramic Plant Pot', 'Indoor planter with matching tray sized for herbs and tabletop greenery.', 22.00, 'https://picsum.photos/seed/ceramic-plant-pot/600/400'),
  (23, 'Rechargeable Hand Mixer', 'Cordless kitchen mixer with multiple speeds and easy-clean beaters.', 58.00, 'https://picsum.photos/seed/rechargeable-hand-mixer/600/400'),
  (24, 'Minimal Floor Lamp', 'Slim standing lamp that adds warm light to reading corners and living rooms.', 96.00, 'https://picsum.photos/seed/minimal-floor-lamp/600/400'),
  (25, 'Leather Card Holder', 'Compact card wallet with stitched slots for daily essentials.', 34.00, 'https://picsum.photos/seed/leather-card-holder/600/400'),
  (26, 'Insulated Lunch Box', 'Leak-resistant lunch carrier with modular compartments for work or school.', 33.00, 'https://picsum.photos/seed/insulated-lunch-box/600/400')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url;

SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));
`;

function tokenHash(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toSafeUser(row: {
  id: number;
  name: string;
  email: string;
  phone_number: string;
}): SafeUser {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    phoneNumber: row.phone_number,
  };
}

function readAccessToken(req: Request): string | null {
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.slice(7).trim();
  }

  const cookieToken = req.cookies?.accessToken;
  return typeof cookieToken === 'string' && cookieToken.length > 0 ? cookieToken : null;
}

async function createSession(userId: string): Promise<string> {
  const rawToken = randomBytes(32).toString('hex');
  const hashed = tokenHash(rawToken);
  const expiresAt = new Date(Date.now() + sessionHours * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, hashed, expiresAt.toISOString()],
  );

  return rawToken;
}

async function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const rawToken = readAccessToken(req);
  if (!rawToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const hashed = tokenHash(rawToken);
  const query = await pool.query<{
    id: number;
    name: string;
    email: string;
    phone_number: string;
  }>(
    `SELECT u.id, u.name, u.email, u.phone_number
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [hashed],
  );

  if (!query.rows[0]) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  req.currentUser = toSafeUser(query.rows[0]);
  req.accessToken = rawToken;
  next();
}

async function initDatabase(): Promise<void> {
  await pool.query(schemaSql);
  await pool.query(seedSql);
}

app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/api/v1/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      phoneNumber?: string;
    };

    const phoneRegex = /^\+?[1-9][0-9]{9,14}$/;
    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !confirmPassword ||
      !phoneNumber?.trim() ||
      password !== confirmPassword ||
      !passwordPolicy.test(password) ||
      !phoneRegex.test(phoneNumber.trim())
    ) {
      res.status(400).json({ message: 'INVALID_REGISTER_PAYLOAD' });
      return;
    }

    const normalized = normalizeEmail(email);
    const duplicate = await pool.query(`SELECT id FROM users WHERE email = $1`, [normalized]);
    if (duplicate.rows.length > 0) {
      res.status(409).json({ message: 'EMAIL_IN_USE' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const inserted = await pool.query<{
      id: number;
      name: string;
      email: string;
      phone_number: string;
    }>(
      `INSERT INTO users (name, email, phone_number, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone_number`,
      [name.trim(), normalized, phoneNumber.trim(), passwordHash],
    );

    const user = toSafeUser(inserted.rows[0]);
    const accessToken = await createSession(user.id);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: sessionHours * 60 * 60 * 1000,
      secure: false,
    });

    res.status(201).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      res.status(400).json({ message: 'INVALID_LOGIN_PAYLOAD' });
      return;
    }

    const normalized = normalizeEmail(email);
    const users = await pool.query<{
      id: number;
      name: string;
      email: string;
      phone_number: string;
      password_hash: string;
    }>(
      `SELECT id, name, email, phone_number, password_hash FROM users WHERE email = $1`,
      [normalized],
    );

    const userRow = users.rows[0];
    if (!userRow) {
      res.status(401).json({ message: 'INVALID_CREDENTIALS' });
      return;
    }

    const validPassword = await bcrypt.compare(password, userRow.password_hash);
    if (!validPassword) {
      res.status(401).json({ message: 'INVALID_CREDENTIALS' });
      return;
    }

    const user = toSafeUser(userRow);
    const accessToken = await createSession(user.id);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: sessionHours * 60 * 60 * 1000,
      secure: false,
    });

    res.status(200).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/auth/logout', authMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const token = req.accessToken;
    if (token) {
      await pool.query(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash(token)]);
    }
    res.clearCookie('accessToken');
    res.status(200).json({ message: 'LOGOUT_SUCCESS' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/catalog/products', async (_, res, next) => {
  try {
    const products = await pool.query<{
      id: number;
      title: string;
      image_url: string;
    }>(`SELECT id, title, image_url FROM products ORDER BY id ASC`);

    res.status(200).json(
      products.rows.map((row) => ({
        id: row.id,
        title: row.title,
        url: row.image_url,
      })),
    );
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/catalog/products/:id', async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      res.status(400).json({ message: 'INVALID_PRODUCT_ID' });
      return;
    }

    const product = await pool.query<{
      id: number;
      title: string;
      description: string;
      price: string;
      image_url: string;
    }>(
      `SELECT id, title, description, price, image_url FROM products WHERE id = $1`,
      [productId],
    );

    if (!product.rows[0]) {
      res.status(404).json({ message: 'PRODUCT_NOT_FOUND' });
      return;
    }

    const row = product.rows[0];
    res.status(200).json({
      id: row.id,
      title: row.title,
      description: row.description,
      price: Number(row.price),
      url: row.image_url,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/cart/items', authMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const productId = Number(req.body?.productId);
    const quantity = req.body?.quantity ? Number(req.body.quantity) : 1;
    const userId = Number(req.currentUser?.id);

    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      res.status(400).json({ message: 'INVALID_CART_ITEM_PAYLOAD' });
      return;
    }

    const productExists = await pool.query(`SELECT id FROM products WHERE id = $1`, [productId]);
    if (!productExists.rows[0]) {
      res.status(404).json({ message: 'PRODUCT_NOT_FOUND' });
      return;
    }

    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()`,
      [userId, productId, quantity],
    );

    const items = await pool.query<{
      id: number;
      product_id: number;
      quantity: number;
      title: string;
      image_url: string;
      price: string;
    }>(
      `SELECT ci.id, ci.product_id, ci.quantity, p.title, p.image_url, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1 AND ci.product_id = $2`,
      [userId, productId],
    );

    const item = items.rows[0];
    res.status(200).json({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      title: item.title,
      url: item.image_url,
      price: Number(item.price),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/cart/items/remove', authMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const productId = Number(req.body?.productId);
    const quantity = req.body?.quantity ? Number(req.body.quantity) : 1;
    const userId = Number(req.currentUser?.id);

    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      res.status(400).json({ message: 'INVALID_CART_ITEM_PAYLOAD' });
      return;
    }

    const existingItem = await pool.query<{ id: number; quantity: number }>(
      `SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2`,
      [userId, productId],
    );

    if (!existingItem.rows[0]) {
      res.status(404).json({ message: 'CART_ITEM_NOT_FOUND' });
      return;
    }

    const currentQuantity = existingItem.rows[0].quantity;
    const nextQuantity = currentQuantity - quantity;

    if (nextQuantity > 0) {
      const updated = await pool.query<{
        id: number;
        product_id: number;
        quantity: number;
        title: string;
        image_url: string;
        price: string;
      }>(
        `UPDATE cart_items
         SET quantity = $1, updated_at = NOW()
         WHERE user_id = $2 AND product_id = $3
         RETURNING id, product_id, quantity,
           (SELECT title FROM products WHERE id = product_id) AS title,
           (SELECT image_url FROM products WHERE id = product_id) AS image_url,
           (SELECT price FROM products WHERE id = product_id) AS price`,
        [nextQuantity, userId, productId],
      );

      const item = updated.rows[0];
      res.status(200).json({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        title: item.title,
        url: item.image_url,
        price: Number(item.price),
      });
      return;
    }

    await pool.query(`DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`, [
      userId,
      productId,
    ]);

    res.status(200).json({
      productId,
      quantity: 0,
      removed: true,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/cart', authMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = Number(req.currentUser?.id);
    const items = await pool.query<{
      id: number;
      product_id: number;
      quantity: number;
      title: string;
      image_url: string;
      price: string;
    }>(
      `SELECT ci.id, ci.product_id, ci.quantity, p.title, p.image_url, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [userId],
    );

    res.status(200).json(
      items.rows.map((row) => ({
        id: row.id,
        productId: row.product_id,
        title: row.title,
        url: row.image_url,
        quantity: row.quantity,
        price: Number(row.price),
        lineTotal: Number(row.price) * row.quantity,
      })),
    );
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
});

async function start(): Promise<void> {
  await initDatabase();
  app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });
}

void start().catch((error) => {
  console.error('API failed to start', error);
  process.exit(1);
});
