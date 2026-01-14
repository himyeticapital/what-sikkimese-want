const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id SERIAL PRIMARY KEY,
                reference_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                district VARCHAR(100) NOT NULL,
                location VARCHAR(255) NOT NULL,
                amenities TEXT[] NOT NULL,
                other_amenity VARCHAR(255),
                description TEXT NOT NULL,
                population INTEGER,
                priority VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                admin_notes TEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `);

        // Insert default admin if not exists
        const adminCheck = await pool.query('SELECT * FROM admins WHERE username = $1', ['admin']);
        if (adminCheck.rows.length === 0) {
            await pool.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['admin', 'admin123']);
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Helper function to generate reference ID
function generateReferenceId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SKM${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
}

// API Routes

// Submit new request
app.post('/api/requests', async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            district,
            location,
            amenities,
            otherAmenity,
            description,
            population,
            priority
        } = req.body;

        const referenceId = generateReferenceId();

        const result = await pool.query(
            `INSERT INTO requests (reference_id, name, email, phone, district, location, amenities, other_amenity, description, population, priority)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id, reference_id`,
            [referenceId, name, email, phone, district, location, amenities, otherAmenity || null, description, population || null, priority]
        );

        res.json({
            success: true,
            referenceId: result.rows[0].reference_id,
            id: result.rows[0].id,
            message: 'Request submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting request:', error);
        res.status(500).json({ success: false, message: 'Failed to submit request' });
    }
});

// Get all requests (Admin)
app.get('/api/requests', async (req, res) => {
    try {
        const { status, district, priority } = req.query;
        let query = 'SELECT * FROM requests WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        if (district) {
            query += ` AND district = $${paramIndex}`;
            params.push(district);
            paramIndex++;
        }
        if (priority) {
            query += ` AND priority = $${paramIndex}`;
            params.push(priority);
            paramIndex++;
        }

        query += ' ORDER BY submitted_at DESC';

        const result = await pool.query(query, params);
        res.json({ success: true, requests: result.rows });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
});

// Get single request by ID
app.get('/api/requests/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.json({ success: true, request: result.rows[0] });
    } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch request' });
    }
});

// Update request (Admin)
app.put('/api/requests/:id', async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        const result = await pool.query(
            `UPDATE requests SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
            [status, adminNotes || null, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.json({ success: true, message: 'Request updated successfully' });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ success: false, message: 'Failed to update request' });
    }
});

// Delete request (Admin)
app.delete('/api/requests/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM requests WHERE id = $1 RETURNING *', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.json({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ success: false, message: 'Failed to delete request' });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM admins WHERE username = $1 AND password = $2', [username, password]);

        if (result.rows.length > 0) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Get recent public requests (for live feed)
app.get('/api/requests/public/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const result = await pool.query(
            `SELECT id, name, district, location, amenities, priority, status, submitted_at
             FROM requests ORDER BY submitted_at DESC LIMIT $1`,
            [limit]
        );

        const recentRequests = result.rows.map(r => ({
            id: r.id,
            name: r.name.split(' ')[0] + ' ' + r.name.split(' ').slice(1).map(n => n[0] + '.').join(''),
            district: r.district,
            location: r.location,
            amenities: r.amenities,
            priority: r.priority,
            status: r.status,
            submitted_at: r.submitted_at
        }));

        res.json({ success: true, requests: recentRequests });
    } catch (error) {
        console.error('Error fetching public requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
});

// Get statistics (Admin Dashboard)
app.get('/api/stats', async (req, res) => {
    try {
        const totalResult = await pool.query('SELECT COUNT(*) FROM requests');
        const pendingResult = await pool.query("SELECT COUNT(*) FROM requests WHERE status = 'Pending'");
        const approvedResult = await pool.query("SELECT COUNT(*) FROM requests WHERE status = 'Approved'");
        const rejectedResult = await pool.query("SELECT COUNT(*) FROM requests WHERE status = 'Rejected'");

        const byDistrictResult = await pool.query('SELECT district, COUNT(*) as count FROM requests GROUP BY district');
        const byPriorityResult = await pool.query('SELECT priority, COUNT(*) as count FROM requests GROUP BY priority');

        res.json({
            success: true,
            stats: {
                total: parseInt(totalResult.rows[0].count),
                pending: parseInt(pendingResult.rows[0].count),
                approved: parseInt(approvedResult.rows[0].count),
                rejected: parseInt(rejectedResult.rows[0].count),
                byDistrict: byDistrictResult.rows,
                byPriority: byPriorityResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
});

// Serve admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server first, then initialize DB
app.listen(PORT, async () => {
    console.log(`\n========================================`);
    console.log(`  What Sikkimese Want! - Server Running`);
    console.log(`========================================\n`);
    console.log(`  Server running on port ${PORT}`);
    console.log(`\n  Admin Credentials:`);
    console.log(`    Username: admin`);
    console.log(`    Password: admin123`);
    console.log(`\n========================================\n`);

    // Initialize database after server starts
    await initDB();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await pool.end();
    process.exit(0);
});
