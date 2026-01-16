require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// Import notification services
const { initializeEmailService, sendConfirmationEmail, sendStatusUpdateEmail } = require('./services/emailService');
const { initializeTelegramService, sendNewRequestNotification, sendStatusUpdateNotification } = require('./services/telegramService');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - required for Railway and other cloud platforms
// Trust only the first proxy (Railway's load balancer)
app.set('trust proxy', 1);

// Rate limiting configuration
// Request submission: Allow 20 requests per 15 minutes per IP
// This prevents spam while allowing legitimate users to submit multiple requests
const requestSubmissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per 15 minutes - reasonable for production
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Feedback submission: Allow 15 requests per 15 minutes per IP
const feedbackSubmissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 feedback submissions per 15 minutes
    message: {
        success: false,
        message: 'Too many feedback submissions. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API: Allow 100 requests per minute for browsing/viewing
const generalApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Increased from 30 to allow smooth browsing experience
    message: {
        success: false,
        message: 'Too many requests. Please slow down.'
    }
});

// Admin login rate limiting: Allow 5 attempts per 15 minutes
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Only count failed login attempts
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Apply general rate limiting to all API routes
app.use('/api/', generalApiLimiter);

// In-memory session store with expiration (24 hours)
const adminSessions = new Map(); // Map of { token: { createdAt: timestamp } }
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Generate secure random session token
function generateSessionToken() {
    return require('crypto').randomBytes(32).toString('hex');
}

// Simple authentication middleware for admin routes with session expiration
const adminAuth = (req, res, next) => {
    const sessionToken = req.headers['x-admin-token'];

    // Check if session token exists
    if (!sessionToken || !adminSessions.has(sessionToken)) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized. Admin access required.'
        });
    }

    // Check if session has expired
    const session = adminSessions.get(sessionToken);
    const now = Date.now();

    if (now - session.createdAt > SESSION_EXPIRY) {
        // Session expired, remove it
        adminSessions.delete(sessionToken);
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.'
        });
    }

    // Session is valid
    return next();
};

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
                gpu VARCHAR(255),
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

        // Add gpu column if it doesn't exist (for existing databases)
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='gpu') THEN
                    ALTER TABLE requests ADD COLUMN gpu VARCHAR(255);
                END IF;
            END $$;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `);

        // Insert default admin if not exists (with bcrypt hashed password)
        const adminCheck = await pool.query('SELECT * FROM admins WHERE username = $1', ['admin']);
        if (adminCheck.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['admin', hashedPassword]);
            console.log('✅ Default admin created with hashed password');
        } else {
            // Check if existing admin has plain text password (starts with 'admin' and length < 30)
            const existingAdmin = adminCheck.rows[0];
            if (existingAdmin.password.length < 30) {
                console.log('⚠️  WARNING: Existing admin has plain text password. Migrating to bcrypt...');
                const hashedPassword = await bcrypt.hash(existingAdmin.password, 10);
                await pool.query('UPDATE admins SET password = $1 WHERE username = $2', [hashedPassword, 'admin']);
                console.log('✅ Admin password migrated to bcrypt hash');
            }
        }

        // Create feedback table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS feedback (
                id SERIAL PRIMARY KEY,
                reference_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                district VARCHAR(100),
                feedback_type VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'New',
                admin_notes TEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP
            )
        `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Helper function to generate reference ID for requests
function generateReferenceId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SKM${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
}

// Helper function to generate reference ID for feedback
function generateFeedbackId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `FB${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
}

// API Routes

// Submit new request with validation and rate limiting
app.post('/api/requests',
    requestSubmissionLimiter,
    [
        body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
        body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('phone').trim().notEmpty().withMessage('Phone is required').matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
        body('district').trim().notEmpty().withMessage('District is required').isIn(['Gangtok', 'Mangan', 'Namchi', 'Gyalshing', 'Pakyong', 'Soreng']).withMessage('Invalid district'),
        body('gpu').optional().trim().isLength({ max: 255 }).withMessage('GPU name too long'),
        body('location').trim().notEmpty().withMessage('Location is required').isLength({ min: 3, max: 255 }).withMessage('Location must be between 3 and 255 characters'),
        body('amenities').isArray({ min: 1 }).withMessage('At least one amenity must be selected'),
        body('amenities.*').trim().notEmpty().withMessage('Amenity cannot be empty'),
        body('otherAmenity').optional().trim().isLength({ max: 255 }).withMessage('Other amenity too long'),
        body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
        body('population').optional().isInt({ min: 1, max: 1000000 }).withMessage('Population must be a valid number'),
        body('priority').trim().notEmpty().withMessage('Priority is required').isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority level')
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        try {
            const {
                name,
                email,
                phone,
                district,
                gpu,
                location,
                amenities,
                otherAmenity,
                description,
                population,
                priority
            } = req.body;

            const referenceId = generateReferenceId();

            const result = await pool.query(
                `INSERT INTO requests (reference_id, name, email, phone, district, gpu, location, amenities, other_amenity, description, population, priority)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 RETURNING id, reference_id`,
                [referenceId, name, email, phone, district, gpu || null, location, amenities, otherAmenity || null, description, population || null, priority]
            );

        // Send response immediately to user
        res.json({
            success: true,
            referenceId: result.rows[0].reference_id,
            id: result.rows[0].id,
            message: 'Request submitted successfully'
        });

        // Send notifications asynchronously (don't block response)
        const requestData = {
            name,
            email,
            phone,
            district,
            gpu,
            location,
            amenities,
            description,
            population,
            priority,
            referenceId
        };

        // Send email confirmation
        sendConfirmationEmail(requestData).catch(err => {
            console.error('Failed to send confirmation email:', err);
        });

        // Send Telegram notification to district group
        sendNewRequestNotification(requestData).catch(err => {
            console.error('Failed to send Telegram notification:', err);
        });

    } catch (error) {
        console.error('Error submitting request:', error);
        res.status(500).json({ success: false, message: 'Failed to submit request' });
    }
});

// Get all requests (Admin)
app.get('/api/requests', adminAuth, async (req, res) => {
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

// Get single request by ID (Admin)
app.get('/api/requests/:id', adminAuth, async (req, res) => {
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

// Track request by reference ID (Public)
app.get('/api/track/:referenceId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT reference_id, district, location, amenities, priority, status, admin_notes, submitted_at, updated_at
             FROM requests WHERE reference_id = $1`,
            [req.params.referenceId.toUpperCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No request found with this reference ID' });
        }

        const request = result.rows[0];
        res.json({
            success: true,
            request: {
                referenceId: request.reference_id,
                district: request.district,
                location: request.location,
                amenities: request.amenities,
                priority: request.priority,
                status: request.status,
                adminNotes: request.admin_notes,
                submittedAt: request.submitted_at,
                updatedAt: request.updated_at
            }
        });
    } catch (error) {
        console.error('Error tracking request:', error);
        res.status(500).json({ success: false, message: 'Failed to track request' });
    }
});

// Update request (Admin)
app.put('/api/requests/:id', adminAuth, async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        // Get the request details before updating (for email notification)
        const oldRequest = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);

        if (oldRequest.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const oldData = oldRequest.rows[0];
        const oldStatus = oldData.status;

        const result = await pool.query(
            `UPDATE requests SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
            [status, adminNotes || null, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Send response immediately
        res.json({ success: true, message: 'Request updated successfully' });

        // Send notifications asynchronously if status changed
        if (status !== oldStatus) {
            const updateData = {
                email: result.rows[0].email,
                name: result.rows[0].name,
                referenceId: result.rows[0].reference_id,
                oldStatus: oldStatus,
                newStatus: status,
                adminNotes: adminNotes,
                district: result.rows[0].district,
                location: result.rows[0].location,
                amenities: result.rows[0].amenities
            };

            // Send email notification
            sendStatusUpdateEmail(updateData).catch(err => {
                console.error('Failed to send status update email:', err);
            });

            // Optionally send Telegram notification (comment out if you don't want group updates)
            // sendStatusUpdateNotification({
            //     district: result.rows[0].district,
            //     referenceId: result.rows[0].reference_id,
            //     oldStatus: oldStatus,
            //     newStatus: status,
            //     adminNotes: adminNotes,
            //     location: result.rows[0].location
            // }).catch(err => console.error('Failed to send Telegram update:', err));
        }
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ success: false, message: 'Failed to update request' });
    }
});

// Delete request (Admin)
app.delete('/api/requests/:id', adminAuth, async (req, res) => {
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

// Admin login with bcrypt and rate limiting
app.post('/api/admin/login', loginRateLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Get admin from database
        const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const admin = result.rows[0];

        // Compare password with bcrypt
        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate secure session token
        const sessionToken = generateSessionToken();
        adminSessions.set(sessionToken, {
            createdAt: Date.now(),
            username: username
        });

        console.log(`✅ Admin logged in: ${username}`);
        res.json({
            success: true,
            message: 'Login successful',
            token: sessionToken,
            expiresIn: '24 hours'
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Admin logout
app.post('/api/admin/logout', adminAuth, async (req, res) => {
    try {
        const sessionToken = req.headers['x-admin-token'];
        adminSessions.delete(sessionToken);
        console.log('✅ Admin logged out');
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ success: false, message: 'Logout failed' });
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

// Get requests by district (Public)
app.get('/api/districts/:district/requests', async (req, res) => {
    try {
        const district = req.params.district;
        const limit = parseInt(req.query.limit) || 20;

        // Get requests for this district
        const requestsResult = await pool.query(
            `SELECT id, reference_id, name, location, amenities, priority, status, submitted_at
             FROM requests WHERE LOWER(district) = LOWER($1) ORDER BY submitted_at DESC LIMIT $2`,
            [district, limit]
        );

        // Get stats for this district
        const totalResult = await pool.query(
            'SELECT COUNT(*) FROM requests WHERE LOWER(district) = LOWER($1)',
            [district]
        );
        const pendingResult = await pool.query(
            "SELECT COUNT(*) FROM requests WHERE LOWER(district) = LOWER($1) AND status = 'Pending'",
            [district]
        );
        const approvedResult = await pool.query(
            "SELECT COUNT(*) FROM requests WHERE LOWER(district) = LOWER($1) AND status = 'Approved'",
            [district]
        );

        const requests = requestsResult.rows.map(r => ({
            id: r.id,
            referenceId: r.reference_id,
            name: r.name.split(' ')[0] + ' ' + r.name.split(' ').slice(1).map(n => n[0] + '.').join(''),
            location: r.location,
            amenities: r.amenities,
            priority: r.priority,
            status: r.status,
            submittedAt: r.submitted_at
        }));

        res.json({
            success: true,
            district: district,
            stats: {
                total: parseInt(totalResult.rows[0].count),
                pending: parseInt(pendingResult.rows[0].count),
                approved: parseInt(approvedResult.rows[0].count)
            },
            requests: requests
        });
    } catch (error) {
        console.error('Error fetching district requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch district requests' });
    }
});

// ==========================================
// FEEDBACK API ROUTES
// ==========================================

// Submit new feedback with validation and rate limiting
app.post('/api/feedback',
    feedbackSubmissionLimiter,
    [
        body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
        body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('phone').optional().trim().matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
        body('district').optional().trim().isIn(['Gangtok', 'Mangan', 'Namchi', 'Gyalshing', 'Pakyong', 'Soreng', '']).withMessage('Invalid district'),
        body('type').trim().notEmpty().withMessage('Feedback type is required').isIn(['Suggestion', 'Complaint', 'Appreciation', 'General']).withMessage('Invalid feedback type'),
        body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        try {
            const { name, email, phone, district, type, message } = req.body;

            const referenceId = generateFeedbackId();

            const result = await pool.query(
                `INSERT INTO feedback (reference_id, name, email, phone, district, feedback_type, message)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id, reference_id`,
                [referenceId, name, email, phone || null, district || null, type, message]
            );

            res.json({
                success: true,
                referenceId: result.rows[0].reference_id,
                id: result.rows[0].id,
                message: 'Feedback submitted successfully'
            });
        } catch (error) {
            console.error('Error submitting feedback:', error);
            res.status(500).json({ success: false, message: 'Failed to submit feedback' });
        }
    }
);

// Get all feedback (Admin)
app.get('/api/feedback', adminAuth, async (req, res) => {
    try {
        const { status, type } = req.query;
        let query = 'SELECT * FROM feedback WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        if (type) {
            query += ` AND feedback_type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        query += ' ORDER BY submitted_at DESC';

        const result = await pool.query(query, params);
        res.json({ success: true, feedback: result.rows });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
    }
});

// Get single feedback by ID (Admin)
app.get('/api/feedback/:id', adminAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM feedback WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.json({ success: true, feedback: result.rows[0] });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
    }
});

// Update feedback (Admin)
app.put('/api/feedback/:id', adminAuth, async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        const result = await pool.query(
            `UPDATE feedback SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
            [status, adminNotes || null, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.json({ success: true, message: 'Feedback updated successfully' });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ success: false, message: 'Failed to update feedback' });
    }
});

// Delete feedback (Admin)
app.delete('/api/feedback/:id', adminAuth, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM feedback WHERE id = $1 RETURNING *', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.json({ success: true, message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ success: false, message: 'Failed to delete feedback' });
    }
});

// Get statistics (Admin Dashboard)
app.get('/api/stats', adminAuth, async (req, res) => {
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

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server first
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);

    // Initialize database after server starts
    initDB().catch(err => console.error('DB init error:', err));

    // Initialize notification services
    console.log('\n📧 Initializing notification services...');
    initializeEmailService();
    initializeTelegramService();
    console.log('✅ Notification services ready\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await pool.end();
    process.exit(0);
});
