const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Database file paths
const DB_FILE = path.join(__dirname, 'data.json');

// Initialize database
function initDB() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            requests: [],
            admins: [{ id: 1, username: 'admin', password: 'admin123' }]
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

// Save database
function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Initialize on startup
let db = initDB();

// Helper function to generate reference ID
function generateReferenceId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SKM${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
}

// API Routes

// Submit new request
app.post('/api/requests', (req, res) => {
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
        const submittedAt = new Date().toISOString();

        const newRequest = {
            id: db.requests.length + 1,
            reference_id: referenceId,
            name,
            email,
            phone,
            district,
            location,
            amenities: amenities,
            other_amenity: otherAmenity || null,
            description,
            population: population || null,
            priority,
            status: 'Pending',
            admin_notes: null,
            submitted_at: submittedAt,
            updated_at: null
        };

        db.requests.push(newRequest);
        saveDB(db);

        res.json({
            success: true,
            referenceId,
            id: newRequest.id,
            message: 'Request submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting request:', error);
        res.status(500).json({ success: false, message: 'Failed to submit request' });
    }
});

// Get all requests (Admin)
app.get('/api/requests', (req, res) => {
    try {
        const { status, district, priority } = req.query;
        let requests = [...db.requests];

        if (status) {
            requests = requests.filter(r => r.status === status);
        }
        if (district) {
            requests = requests.filter(r => r.district === district);
        }
        if (priority) {
            requests = requests.filter(r => r.priority === priority);
        }

        // Sort by submitted_at descending
        requests.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

        res.json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
});

// Get single request by ID
app.get('/api/requests/:id', (req, res) => {
    try {
        const request = db.requests.find(r => r.id === parseInt(req.params.id));

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.json({ success: true, request });
    } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch request' });
    }
});

// Update request (Admin)
app.put('/api/requests/:id', (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const updatedAt = new Date().toISOString();

        const requestIndex = db.requests.findIndex(r => r.id === parseInt(req.params.id));

        if (requestIndex === -1) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        db.requests[requestIndex].status = status;
        db.requests[requestIndex].admin_notes = adminNotes || null;
        db.requests[requestIndex].updated_at = updatedAt;

        saveDB(db);

        res.json({ success: true, message: 'Request updated successfully' });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ success: false, message: 'Failed to update request' });
    }
});

// Delete request (Admin)
app.delete('/api/requests/:id', (req, res) => {
    try {
        const requestIndex = db.requests.findIndex(r => r.id === parseInt(req.params.id));

        if (requestIndex === -1) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        db.requests.splice(requestIndex, 1);
        saveDB(db);

        res.json({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ success: false, message: 'Failed to delete request' });
    }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = db.admins.find(a => a.username === username && a.password === password);

        if (admin) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Get statistics (Admin Dashboard)
app.get('/api/stats', (req, res) => {
    try {
        const totalRequests = db.requests.length;
        const pendingRequests = db.requests.filter(r => r.status === 'Pending').length;
        const approvedRequests = db.requests.filter(r => r.status === 'Approved').length;
        const rejectedRequests = db.requests.filter(r => r.status === 'Rejected').length;

        // Requests by district
        const requestsByDistrict = {};
        db.requests.forEach(r => {
            requestsByDistrict[r.district] = (requestsByDistrict[r.district] || 0) + 1;
        });
        const byDistrict = Object.entries(requestsByDistrict).map(([district, count]) => ({ district, count }));

        // Requests by priority
        const requestsByPriority = {};
        db.requests.forEach(r => {
            requestsByPriority[r.priority] = (requestsByPriority[r.priority] || 0) + 1;
        });
        const byPriority = Object.entries(requestsByPriority).map(([priority, count]) => ({ priority, count }));

        res.json({
            success: true,
            stats: {
                total: totalRequests,
                pending: pendingRequests,
                approved: approvedRequests,
                rejected: rejectedRequests,
                byDistrict,
                byPriority
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

// Start server
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  What Sikkimese Want! - Server Running`);
    console.log(`========================================\n`);
    console.log(`  User Portal:     http://localhost:${PORT}`);
    console.log(`  Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`\n  Admin Credentials:`);
    console.log(`    Username: admin`);
    console.log(`    Password: admin123`);
    console.log(`\n========================================\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});
