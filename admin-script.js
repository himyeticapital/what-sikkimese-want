const API_URL = 'http://localhost:3000/api';
let currentRequestId = null;

// Check if admin is logged in
let isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';

if (isLoggedIn) {
    showDashboard();
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
        } else {
            alert('Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please ensure the server is running.');
    }
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
});

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';
    loadStats();
    loadRequests();
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('statTotal').textContent = data.stats.total;
            document.getElementById('statPending').textContent = data.stats.pending;
            document.getElementById('statApproved').textContent = data.stats.approved;
            document.getElementById('statRejected').textContent = data.stats.rejected;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load requests
async function loadRequests(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/requests?${queryParams}`);
        const data = await response.json();

        if (data.success) {
            displayRequests(data.requests);
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        document.getElementById('requestsTableBody').innerHTML = `
            <tr><td colspan="8" class="loading">Error loading requests. Please ensure the server is running.</td></tr>
        `;
    }
}

// Display requests in table
function displayRequests(requests) {
    const tbody = document.getElementById('requestsTableBody');

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No requests found</td></tr>';
        return;
    }

    tbody.innerHTML = requests.map(request => {
        const statusClass = request.status.toLowerCase().replace(' ', '-');
        const priorityClass = request.priority.toLowerCase();
        const amenitiesList = request.amenities.slice(0, 2).join(', ') +
            (request.amenities.length > 2 ? '...' : '');
        const date = new Date(request.submitted_at).toLocaleDateString();

        return `
            <tr>
                <td>${request.reference_id}</td>
                <td>${request.name}</td>
                <td>${request.district}</td>
                <td>${amenitiesList}</td>
                <td><span class="priority-badge priority-${priorityClass}">${request.priority}</span></td>
                <td><span class="status-badge status-${statusClass}">${request.status}</span></td>
                <td>${date}</td>
                <td><button class="btn-view" onclick="viewRequest(${request.id})">View</button></td>
            </tr>
        `;
    }).join('');
}

// View request details
async function viewRequest(id) {
    try {
        const response = await fetch(`${API_URL}/requests/${id}`);
        const data = await response.json();

        if (data.success) {
            currentRequestId = id;
            showRequestDetail(data.request);
        }
    } catch (error) {
        console.error('Error loading request:', error);
        alert('Failed to load request details');
    }
}

// Show request detail modal
function showRequestDetail(request) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');

    const amenitiesList = request.amenities.join(', ');
    const submittedDate = new Date(request.submitted_at).toLocaleString();
    const updatedDate = request.updated_at ? new Date(request.updated_at).toLocaleString() : 'N/A';

    content.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Reference ID:</span>
            <span class="detail-value">${request.reference_id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${request.name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${request.email}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${request.phone}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">District:</span>
            <span class="detail-value">${request.district}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${request.location}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Amenities Requested:</span>
            <span class="detail-value">${amenitiesList}</span>
        </div>
        ${request.other_amenity ? `
        <div class="detail-row">
            <span class="detail-label">Other Amenity:</span>
            <span class="detail-value">${request.other_amenity}</span>
        </div>
        ` : ''}
        <div class="detail-row">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${request.description}</span>
        </div>
        ${request.population ? `
        <div class="detail-row">
            <span class="detail-label">Population Benefiting:</span>
            <span class="detail-value">${request.population}</span>
        </div>
        ` : ''}
        <div class="detail-row">
            <span class="detail-label">Priority:</span>
            <span class="detail-value">${request.priority}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Current Status:</span>
            <span class="detail-value">${request.status}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Submitted:</span>
            <span class="detail-value">${submittedDate}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Last Updated:</span>
            <span class="detail-value">${updatedDate}</span>
        </div>
        ${request.admin_notes ? `
        <div class="detail-row">
            <span class="detail-label">Previous Admin Notes:</span>
            <span class="detail-value">${request.admin_notes}</span>
        </div>
        ` : ''}
    `;

    document.getElementById('updateStatus').value = request.status;
    document.getElementById('adminNotes').value = request.admin_notes || '';
    modal.style.display = 'block';
}

// Save changes
document.getElementById('saveChanges').addEventListener('click', async () => {
    const status = document.getElementById('updateStatus').value;
    const adminNotes = document.getElementById('adminNotes').value;

    try {
        const response = await fetch(`${API_URL}/requests/${currentRequestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, adminNotes })
        });

        const data = await response.json();

        if (data.success) {
            alert('Request updated successfully');
            document.getElementById('detailModal').style.display = 'none';
            loadStats();
            loadRequests();
        } else {
            alert('Failed to update request');
        }
    } catch (error) {
        console.error('Error updating request:', error);
        alert('Failed to update request');
    }
});

// Delete request
document.getElementById('deleteRequest').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/requests/${currentRequestId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('Request deleted successfully');
            document.getElementById('detailModal').style.display = 'none';
            loadStats();
            loadRequests();
        } else {
            alert('Failed to delete request');
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        alert('Failed to delete request');
    }
});

// Filter handlers
document.getElementById('applyFilters').addEventListener('click', () => {
    const filters = {
        status: document.getElementById('filterStatus').value,
        district: document.getElementById('filterDistrict').value,
        priority: document.getElementById('filterPriority').value
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });

    loadRequests(filters);
});

document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDistrict').value = '';
    document.getElementById('filterPriority').value = '';
    loadRequests();
});

// Close modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('detailModal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
