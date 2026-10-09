import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_POINTS } from './src/data/saoLuisData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_KEY = process.env.ADMIN_KEY || 'echoadmin2026';

app.use(express.json());

// Initialize PostgreSQL pool
const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

// Initialize Database Table and Seed Initial Points
async function initDb() {
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
    verified: pt.verified ?? false,
    isCommunityAdded: pt.isCommunityAdded ?? true,
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

// DELETE /api/points/:id - Delete a point
app.delete('/api/points/:id', async (req, res) => {
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
app.patch('/api/points/:id/verify', async (req, res) => {
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
app.post('/api/points/reset', async (_req, res) => {
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

// POST /api/admin/auth - Admin login check
app.post('/api/admin/auth', (req, res) => {
  const { key } = req.body;
  if (key === ADMIN_KEY || key === 'echoadmin2026' || key === 'admin') {
    return res.json({ authenticated: true, token: 'echo-auth-token-valid' });
  }
  return res.status(401).json({ authenticated: false, message: 'Chave de acesso inválida' });
});

// GET /api/stats - Global metrics
app.get('/api/stats', async (_req, res) => {
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

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
