import express from 'express';
import { createServer } from 'node:http';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_POINTS } from './src/data/saoLuisData';
import { isAdminHostname } from './src/admin-domain';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_KEY = process.env.ADMIN_KEY;
const ADMIN_SESSION_COOKIE = 'ajudamap_admin_session';
const ADMIN_SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

app.use(express.json({ limit: '1mb' }));

function isAllowedAdminHost(req: express.Request) {
  if (isAdminHostname(req.hostname)) return true;
  return process.env.NODE_ENV !== 'production' &&
    (['localhost', '127.0.0.1'].includes(req.hostname) || req.hostname.endsWith('.vercel.run'));
}

const requireAdminHost: express.RequestHandler = (req, res, next) => {
  if (!isAllowedAdminHost(req)) return res.sendStatus(404);
  next();
};

const requireAdminSession: express.RequestHandler = (req, res, next) => {
  if (!hasValidAdminSession(req)) {
    return res.status(401).json({ authenticated: false, message: 'Sessão administrativa inválida' });
  }
  next();
};

const requireSameOrigin: express.RequestHandler = (req, res, next) => {
  const origin = req.get('origin');
  const host = req.get('host');
  if (!origin || !host) return res.sendStatus(403);

  try {
    if (new URL(origin).host.toLowerCase() !== host.toLowerCase()) return res.sendStatus(403);
  } catch {
    return res.sendStatus(403);
  }

  next();
};

function createAdminSession() {
  const payload = `${Date.now() + ADMIN_SESSION_DURATION_MS}.${randomBytes(32).toString('base64url')}`;
  const signature = createHmac('sha256', ADMIN_KEY || '').update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function hasValidAdminSession(req: express.Request) {
  if (!ADMIN_KEY) return false;

  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!cookie) return false;

  const token = cookie.slice(ADMIN_SESSION_COOKIE.length + 1);
  const [expiresAt, nonce, signature, ...extra] = token.split('.');
  if (!expiresAt || !nonce || !signature || extra.length > 0 || Number(expiresAt) <= Date.now()) return false;

  const payload = `${expiresAt}.${nonce}`;
  const expected = Buffer.from(createHmac('sha256', ADMIN_KEY).update(payload).digest('base64url'));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

app.use('/api/admin', requireAdminHost);

// Initialize PostgreSQL pool
const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

// Initialize Database Table and Seed Initial Points
export async function initDb() {
  if (!pool) {
    console.warn('No DATABASE_URL configured. Running in in-memory mode.');
    return;
  }

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS points (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(50) NOT NULL,
          category_label VARCHAR(100) NOT NULL,
          address TEXT NOT NULL,
          neighborhood VARCHAR(150) NOT NULL,
          city VARCHAR(100) DEFAULT 'São Luís',
          lat DOUBLE PRECISION NOT NULL,
          lng DOUBLE PRECISION NOT NULL,
          hours VARCHAR(255) NOT NULL,
          phone VARCHAR(100),
          whatsapp VARCHAR(100),
          description TEXT NOT NULL,
          accepted_items TEXT[] NOT NULL,
          tips TEXT,
          verified BOOLEAN DEFAULT true,
          is_community_added BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Check if table has rows, if empty seed initial points
      const countRes = await client.query('SELECT COUNT(*) FROM points');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        console.log('Seeding initial São Luís points into PostgreSQL...');
        for (const pt of INITIAL_POINTS) {
          await client.query(
            `INSERT INTO points (
              id, name, category, category_label, address, neighborhood, city,
              lat, lng, hours, phone, whatsapp, description, accepted_items, tips,
              verified, is_community_added
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO NOTHING`,
            [
              pt.id, pt.name, pt.category, pt.categoryLabel, pt.address, pt.neighborhood, pt.city,
              pt.lat, pt.lng, pt.hours, pt.phone || null, pt.whatsapp || null, pt.description,
              pt.acceptedItems, pt.tips || null, pt.verified, false
            ]
          );
        }
        console.log('Seeding completed successfully.');
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Database initialization error:', err.message);
  }
}

// Format DB row to frontend LocationPoint
function mapRowToPoint(row: any) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryLabel: row.category_label,
    address: row.address,
    neighborhood: row.neighborhood,
    city: row.city,
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    hours: row.hours,
    phone: row.phone || undefined,
    whatsapp: row.whatsapp || undefined,
    description: row.description,
    acceptedItems: row.accepted_items || [],
    tips: row.tips || undefined,
    verified: Boolean(row.verified),
    isCommunityAdded: Boolean(row.is_community_added),
  };
}

// In-memory fallback if DB unavailable
let memoryPoints = [...INITIAL_POINTS];

// --- REST API ENDPOINTS ---

// GET /api/points - Fetch all points
app.get('/api/points', async (_req, res) => {
  if (!pool) {
    return res.json(memoryPoints);
  }
  try {
    const result = await pool.query('SELECT * FROM points ORDER BY is_community_added DESC, created_at DESC');
    res.json(result.rows.map(mapRowToPoint));
  } catch (err: any) {
    console.error('Error fetching points from DB:', err.message);
    res.json(memoryPoints);
  }
});

// POST /api/points - Create new point
app.post('/api/points', async (req, res) => {
  const pt = req.body;
  if (!pt.name || !pt.address || !pt.neighborhood) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const pointId = pt.id || `custom-${Date.now()}`;
  const newPoint = {
    ...pt,
    id: pointId,
    verified: false,
    isCommunityAdded: true,
    city: pt.city || 'São Luís',
  };

  if (!pool) {
    memoryPoints = [newPoint, ...memoryPoints];
    return res.status(201).json(newPoint);
  }

  try {
    await pool.query(
      `INSERT INTO points (
        id, name, category, category_label, address, neighborhood, city,
        lat, lng, hours, phone, whatsapp, description, accepted_items, tips,
        verified, is_community_added
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        pointId, newPoint.name, newPoint.category, newPoint.categoryLabel,
        newPoint.address, newPoint.neighborhood, newPoint.city,
        newPoint.lat, newPoint.lng, newPoint.hours,
        newPoint.phone || null, newPoint.whatsapp || null, newPoint.description,
        newPoint.acceptedItems, newPoint.tips || null,
        newPoint.verified, newPoint.isCommunityAdded
      ]
    );
    res.status(201).json(newPoint);
  } catch (err: any) {
    console.error('Error inserting point:', err.message);
    memoryPoints = [newPoint, ...memoryPoints];
    res.status(201).json(newPoint);
  }
});

// POST /api/admin/points - Update a point with an authenticated admin session
app.post('/api/admin/points', requireAdminSession, requireSameOrigin, async (req, res) => {
  const body = req.body || {};
  if (
    typeof body.id !== 'string' || body.id.length > 255 ||
    typeof body.name !== 'string' || !body.name.trim() ||
    typeof body.address !== 'string' || !body.address.trim() ||
    typeof body.neighborhood !== 'string' || !body.neighborhood.trim()
  ) {
    return res.status(400).json({ error: 'Dados do ponto inválidos' });
  }

  const point = {
    id: body.id,
    name: body.name.trim(),
    category: typeof body.category === 'string' ? body.category : 'ecoponto',
    categoryLabel: typeof body.categoryLabel === 'string' ? body.categoryLabel : 'Ecoponto',
    address: body.address.trim(),
    neighborhood: body.neighborhood.trim(),
    city: typeof body.city === 'string' ? body.city : 'São Luís',
    lat: Number.isFinite(Number(body.lat)) ? Number(body.lat) : 0,
    lng: Number.isFinite(Number(body.lng)) ? Number(body.lng) : 0,
    hours: typeof body.hours === 'string' ? body.hours : 'A consultar',
    phone: typeof body.phone === 'string' ? body.phone : null,
    whatsapp: typeof body.whatsapp === 'string' ? body.whatsapp : null,
    description: typeof body.description === 'string' ? body.description : '',
    acceptedItems: Array.isArray(body.acceptedItems)
      ? body.acceptedItems.filter((item: unknown): item is string => typeof item === 'string')
      : [],
    tips: typeof body.tips === 'string' ? body.tips : null,
    verified: body.verified === true,
    isCommunityAdded: body.isCommunityAdded === true,
  };

  if (!pool) {
    memoryPoints = [point, ...memoryPoints.filter((existing) => existing.id !== point.id)];
    return res.json(point);
  }

  try {
    await pool.query(
      `INSERT INTO points (
        id, name, category, category_label, address, neighborhood, city,
        lat, lng, hours, phone, whatsapp, description, accepted_items, tips,
        verified, is_community_added
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, category = EXCLUDED.category, category_label = EXCLUDED.category_label,
        address = EXCLUDED.address, neighborhood = EXCLUDED.neighborhood, city = EXCLUDED.city,
        lat = EXCLUDED.lat, lng = EXCLUDED.lng, hours = EXCLUDED.hours, phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp, description = EXCLUDED.description,
        accepted_items = EXCLUDED.accepted_items, tips = EXCLUDED.tips,
        verified = EXCLUDED.verified, is_community_added = EXCLUDED.is_community_added`,
      [
        point.id, point.name, point.category, point.categoryLabel, point.address, point.neighborhood,
        point.city, point.lat, point.lng, point.hours, point.phone, point.whatsapp, point.description,
        point.acceptedItems, point.tips, point.verified, point.isCommunityAdded,
      ]
    );
    return res.json(point);
  } catch (err: any) {
    console.error('Error saving admin point:', err.message);
    return res.status(500).json({ error: 'Não foi possível salvar o ponto' });
  }
});

// DELETE /api/points/:id - Delete a point
app.delete('/api/points/:id', requireAdminSession, requireSameOrigin, async (req, res) => {
  const { id } = req.params;
  memoryPoints = memoryPoints.filter((p) => p.id !== id);

  if (pool) {
    try {
      await pool.query('DELETE FROM points WHERE id = $1', [id]);
    } catch (err: any) {
      console.error('Error deleting point from DB:', err.message);
    }
  }

  res.json({ success: true, message: 'Ponto removido com sucesso' });
});

// PATCH /api/points/:id/verify - Toggle verified status
app.patch('/api/points/:id/verify', requireAdminSession, requireSameOrigin, async (req, res) => {
  const { id } = req.params;
  const { verified } = req.body;

  let updatedVerified = true;

  if (pool) {
    try {
      const q = typeof verified === 'boolean'
        ? await pool.query('UPDATE points SET verified = $1 WHERE id = $2 RETURNING verified', [verified, id])
        : await pool.query('UPDATE points SET verified = NOT verified WHERE id = $1 RETURNING verified', [id]);
      if (q.rows.length > 0) {
        updatedVerified = q.rows[0].verified;
      }
    } catch (err: any) {
      console.error('Error updating verified status in DB:', err.message);
    }
  }

  memoryPoints = memoryPoints.map((p) => p.id === id ? { ...p, verified: !p.verified } : p);
  res.json({ success: true, verified: updatedVerified });
});

// POST /api/points/reset - Restore initial points
app.post('/api/points/reset', requireAdminSession, requireSameOrigin, async (_req, res) => {
  memoryPoints = [...INITIAL_POINTS];

  if (pool) {
    try {
      await pool.query('DELETE FROM points');
      for (const pt of INITIAL_POINTS) {
        await pool.query(
          `INSERT INTO points (
            id, name, category, category_label, address, neighborhood, city,
            lat, lng, hours, phone, whatsapp, description, accepted_items, tips,
            verified, is_community_added
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            pt.id, pt.name, pt.category, pt.categoryLabel, pt.address, pt.neighborhood, pt.city,
            pt.lat, pt.lng, pt.hours, pt.phone || null, pt.whatsapp || null, pt.description,
            pt.acceptedItems, pt.tips || null, pt.verified, false
          ]
        );
      }
    } catch (err: any) {
      console.error('Error resetting points in DB:', err.message);
    }
  }

  res.json({ success: true, count: INITIAL_POINTS.length });
});

// Admin authentication routes are available only on the dedicated admin hostname.
app.get('/api/admin/session', (req, res) => {
  res.json({ authenticated: hasValidAdminSession(req) });
});

app.post('/api/admin/auth', requireSameOrigin, (req, res) => {
  if (!ADMIN_KEY) {
    return res.status(503).json({ authenticated: false, message: 'A autenticação administrativa não está configurada' });
  }

  const submittedKey = typeof req.body?.key === 'string' ? req.body.key : '';
  const submitted = Buffer.from(submittedKey);
  const expected = Buffer.from(ADMIN_KEY);
  const isValid = submitted.length === expected.length && timingSafeEqual(submitted, expected);
  if (!isValid) {
    return res.status(401).json({ authenticated: false, message: 'Chave de acesso inválida' });
  }

  res.cookie(ADMIN_SESSION_COOKIE, createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_DURATION_MS,
  });
  return res.json({ authenticated: true });
});

app.post('/api/admin/logout', requireSameOrigin, (_req, res) => {
  res.clearCookie(ADMIN_SESSION_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return res.json({ authenticated: false });
});

// GET /api/stats - Global metrics
app.get('/api/stats', requireAdminHost, requireAdminSession, async (_req, res) => {
  if (pool) {
    try {
      const totalRes = await pool.query('SELECT COUNT(*) FROM points');
      const commRes = await pool.query('SELECT COUNT(*) FROM points WHERE is_community_added = true');
      const verRes = await pool.query('SELECT COUNT(*) FROM points WHERE verified = true');
      return res.json({
        total: parseInt(totalRes.rows[0].count, 10),
        community: parseInt(commRes.rows[0].count, 10),
        verified: parseInt(verRes.rows[0].count, 10),
      });
    } catch {
      // fallback
    }
  }

  res.json({
    total: memoryPoints.length,
    community: memoryPoints.filter((p) => p.isCommunityAdded).length,
    verified: memoryPoints.filter((p) => p.verified).length,
  });
});

// Vite middleware in dev or static serving in production
async function startServer() {
  await initDb();
  const httpServer = createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  void startServer();
}
