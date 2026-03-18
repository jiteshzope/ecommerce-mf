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
