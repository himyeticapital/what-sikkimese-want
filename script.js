document.addEventListener('DOMContentLoaded', function() {
    // Dynamic API URL - works on localhost and production
    const API_BASE = window.location.origin;

    const form = document.getElementById('amenityForm');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const otherCheckbox = document.querySelector('input[name="amenity"][value="Other"]');
    const otherAmenityGroup = document.getElementById('otherAmenityGroup');
    const amenityCheckboxes = document.querySelectorAll('input[name="amenity"]');

    // Show/hide "Other" amenity input field
    amenityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (otherCheckbox.checked) {
                otherAmenityGroup.style.display = 'block';
                document.getElementById('otherAmenity').required = true;
            } else {
                otherAmenityGroup.style.display = 'none';
                document.getElementById('otherAmenity').required = false;
                document.getElementById('otherAmenity').value = '';
            }
        });
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate that at least one amenity is selected
        const selectedAmenities = Array.from(amenityCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (selectedAmenities.length === 0) {
            alert('Please select at least one amenity type.');
            return;
        }

        // If "Other" is selected, ensure the text field is filled
        if (selectedAmenities.includes('Other')) {
            const otherAmenityValue = document.getElementById('otherAmenity').value.trim();
            if (!otherAmenityValue) {
                alert('Please specify the other amenity type.');
                return;
            }
        }

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            district: document.getElementById('district').value,
            location: document.getElementById('location').value,
            amenities: selectedAmenities,
            otherAmenity: document.getElementById('otherAmenity').value,
            description: document.getElementById('description').value,
            population: document.getElementById('population').value,
            priority: document.getElementById('priority').value
        };

        // Submit to backend
        submitRequest(formData);
    });

    // Submit request to backend
    async function submitRequest(data) {
        try {
            // Show loading state
            const submitBtn = document.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            const response = await fetch(`${API_BASE}/api/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Restore button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            if (result.success) {
                showSuccessModal(data, result.referenceId);
                form.reset();
                otherAmenityGroup.style.display = 'none';
            } else {
                alert('Failed to submit request. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Error: Could not connect to server. Please try again later.');

            // Restore button
            const submitBtn = document.querySelector('.btn-primary');
            submitBtn.textContent = 'Submit Request';
            submitBtn.disabled = false;
        }
    }

    // Show success modal
    function showSuccessModal(data, referenceId) {
        const amenitiesList = data.amenities.includes('Other')
            ? data.amenities.filter(a => a !== 'Other').concat([data.otherAmenity]).join(', ')
            : data.amenities.join(', ');

        document.getElementById('modalTitle').textContent = 'Request Submitted Successfully!';
        document.getElementById('modalMessage').innerHTML = `
            <p><strong>Thank you, ${data.name}!</strong></p>
            <p>Your request for <strong>${amenitiesList}</strong> in <strong>${data.district} District</strong> has been submitted successfully.</p>
            <p>A confirmation email will be sent to <strong>${data.email}</strong> shortly.</p>
            <p>Reference ID: <strong>${referenceId}</strong></p>
            <p>The concerned department will review your request and contact you within 7-10 working days.</p>
        `;
        modal.style.display = 'block';
    }

    // Close modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Phone number validation
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9+\-\s()]/g, '');
    });

    // Smooth scroll for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add form validation feedback
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#ff6b35';
            } else {
                this.style.borderColor = '#28a745';
            }
        });

        input.addEventListener('focus', function() {
            this.style.borderColor = '#4a90a4';
        });
    });

    // ==========================================
    // LIVE FEED FUNCTIONALITY
    // ==========================================

    const liveFeed = document.getElementById('liveFeed');
    const requestCount = document.getElementById('requestCount');
    const refreshBtn = document.getElementById('refreshFeed');

    // Fetch and display live requests
    async function fetchLiveRequests() {
        try {
            const response = await fetch(`${API_BASE}/api/requests/public/recent?limit=10`);
            const result = await response.json();

            if (result.success && result.requests) {
                displayLiveRequests(result.requests);
                requestCount.textContent = `${result.requests.length}+ requests`;
            }
        } catch (error) {
            console.error('Error fetching live requests:', error);
            liveFeed.innerHTML = '<div class="feed-empty">Unable to load requests. Please try again later.</div>';
        }
    }

    // Display requests in the feed
    function displayLiveRequests(requests) {
        if (requests.length === 0) {
            liveFeed.innerHTML = '<div class="feed-empty">No requests yet. Be the first to submit one!</div>';
            return;
        }

        liveFeed.innerHTML = requests.map(req => {
            const timeAgo = getTimeAgo(new Date(req.submitted_at));
            const amenitiesList = req.amenities.slice(0, 2).join(', ') + (req.amenities.length > 2 ? '...' : '');
            const priorityClass = req.priority.toLowerCase();
            const statusClass = req.status.toLowerCase();

            return `
                <div class="feed-item" data-id="${req.id}">
                    <div class="feed-item-header">
                        <span class="feed-name">${req.name}</span>
                        <span class="feed-time">${timeAgo}</span>
                    </div>
                    <div class="feed-item-body">
                        <div class="feed-amenities">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                            </svg>
                            ${amenitiesList}
                        </div>
                        <div class="feed-location">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${req.location}, ${req.district}
                        </div>
                    </div>
                    <div class="feed-item-footer">
                        <span class="feed-priority priority-${priorityClass}">${req.priority}</span>
                        <span class="feed-status status-${statusClass}">${req.status}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Helper function for time ago
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    // Refresh button handler
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.classList.add('spinning');
            fetchLiveRequests().then(() => {
                setTimeout(() => this.classList.remove('spinning'), 500);
            });
        });
    }

    // Initial load
    fetchLiveRequests();

    // Auto-refresh every 30 seconds
    setInterval(fetchLiveRequests, 30000);

    // ==========================================
    // TRACK STATUS FUNCTIONALITY
    // ==========================================

    const trackBtn = document.getElementById('trackBtn');
    const trackInput = document.getElementById('trackReferenceId');
    const trackResult = document.getElementById('trackResult');

    if (trackBtn) {
        trackBtn.addEventListener('click', trackRequest);
        trackInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                trackRequest();
            }
        });
    }

    async function trackRequest() {
        const referenceId = trackInput.value.trim();

        if (!referenceId) {
            showTrackError('Please enter a reference ID');
            return;
        }

        // Show loading state
        trackBtn.textContent = 'Tracking...';
        trackBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/api/track/${encodeURIComponent(referenceId)}`);
            const result = await response.json();

            trackBtn.textContent = 'Track Status';
            trackBtn.disabled = false;

            if (result.success) {
                showTrackResult(result.request);
            } else {
                showTrackError(result.message || 'Request not found');
            }
        } catch (error) {
            console.error('Error tracking request:', error);
            trackBtn.textContent = 'Track Status';
            trackBtn.disabled = false;
            showTrackError('Unable to connect to server. Please try again.');
        }
    }

    function showTrackResult(request) {
        const statusClass = request.status.toLowerCase().replace(' ', '-');
        const priorityClass = request.priority.toLowerCase();
        const submittedDate = new Date(request.submittedAt).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const updatedDate = request.updatedAt
            ? new Date(request.updatedAt).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })
            : 'Not yet updated';

        trackResult.innerHTML = `
            <div class="track-result-card">
                <div class="track-result-header">
                    <h3>Request Found!</h3>
                    <span class="track-ref-id">${request.referenceId}</span>
                </div>
                <div class="track-result-status">
                    <span class="status-badge status-${statusClass}">${request.status}</span>
                    <span class="priority-badge priority-${priorityClass}">${request.priority} Priority</span>
                </div>
                <div class="track-result-details">
                    <div class="detail-row">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${request.location}, ${request.district}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amenities:</span>
                        <span class="detail-value">${request.amenities.join(', ')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Submitted:</span>
                        <span class="detail-value">${submittedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Last Updated:</span>
                        <span class="detail-value">${updatedDate}</span>
                    </div>
                    ${request.adminNotes ? `
                    <div class="detail-row admin-notes">
                        <span class="detail-label">Notes:</span>
                        <span class="detail-value">${request.adminNotes}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        trackResult.style.display = 'block';
    }

    function showTrackError(message) {
        trackResult.innerHTML = `
            <div class="track-result-error">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <p>${message}</p>
                <small>Please check your reference ID and try again.</small>
            </div>
        `;
        trackResult.style.display = 'block';
    }

    // ==========================================
    // DISTRICT MODAL FUNCTIONALITY
    // ==========================================

    const districtModal = document.getElementById('districtModal');
    const districtClose = document.querySelector('.district-close');
    const districtCards = document.querySelectorAll('.district-card');

    // District data with detailed information
    const districtData = {
        gangtok: {
            name: 'Gangtok District',
            region: 'East Sikkim',
            image: 'https://images.unsplash.com/photo-1615966192539-f1731963b19a?w=800&q=80',
            desc1: 'Gangtok, the capital city of Sikkim, is the largest and most populous district in the state. Nestled at an altitude of 1,650 meters in the eastern Himalayan range, it serves as the administrative, cultural, and economic hub of Sikkim. The district is known for its stunning views of the Kanchenjunga mountain range, Buddhist monasteries, and vibrant markets.',
            desc2: 'The district has witnessed rapid urbanization in recent decades, leading to increased demand for public amenities such as community centers, public toilets, healthcare facilities, and recreational spaces. Key areas include M.G. Marg, Deorali, Tadong, and Ranipool. The community actively participates in development initiatives to improve infrastructure and quality of life.'
        },
        mangan: {
            name: 'Mangan District',
            region: 'North Sikkim',
            image: 'https://images.unsplash.com/photo-1600402808924-9c591a6dace8?w=800&q=80',
            desc1: 'Mangan is the headquarters of North Sikkim, the largest district by area but the least populated. Known for its pristine natural beauty, the district is home to the famous Gurudongmar Lake, Yumthang Valley, and numerous hot springs. The region is characterized by high-altitude terrain, sparse settlements, and challenging weather conditions.',
            desc2: 'Due to its remote location and difficult terrain, many communities in Mangan district lack basic amenities that urban areas take for granted. Road connectivity, healthcare centers, community halls, and educational facilities remain priority areas. The district administration and local communities are working together to bridge the infrastructure gap while preserving the ecological sensitivity of the region.'
        },
        namchi: {
            name: 'Namchi District',
            region: 'South Sikkim',
            image: 'https://images.unsplash.com/photo-1573398643956-2b9e6ade3456?w=800&q=80',
            desc1: 'Namchi, meaning "Sky High" in local language, is the headquarters of South Sikkim and is renowned for its religious and cultural significance. The district is home to the famous Char Dham pilgrimage site, Samdruptse statue, and numerous monasteries and temples. It offers panoramic views of the Kanchenjunga range and is an important tourist destination.',
            desc2: 'The district has seen significant development in tourism infrastructure but still requires improvements in basic public amenities for local communities. Areas like Jorethang, Ravangla, and Yangang have growing populations that need better healthcare facilities, libraries, sports complexes, and community centers. Local participation in development planning has increased substantially in recent years.'
        },
        gyalshing: {
            name: 'Gyalshing District',
            region: 'West Sikkim',
            image: 'https://images.unsplash.com/photo-1632407575668-c956f851c3d7?w=800&q=80',
            desc1: 'Gyalshing (also known as Geyzing) serves as the headquarters of West Sikkim, a district rich in cultural heritage and natural beauty. The region is famous for the Pemayangtse Monastery, one of the oldest and most significant monasteries in Sikkim, and the ruins of Rabdentse, the second capital of the former kingdom of Sikkim.',
            desc2: 'The district faces unique challenges due to its mountainous terrain and scattered settlements. Many villages lack adequate road connectivity, healthcare facilities, and educational institutions. Community-driven initiatives have been instrumental in identifying priority areas for development, including public facilities, water supply systems, and recreational spaces for youth.'
        },
        pakyong: {
            name: 'Pakyong District',
            region: 'East Sikkim',
            image: 'https://images.unsplash.com/photo-1562413181-9013f9846bff?w=800&q=80',
            desc1: 'Pakyong is one of the newest districts in Sikkim, carved out of East Sikkim in 2017. It is home to the Pakyong Airport, also known as Sikkim Greenfield Airport, which is one of the highest airports in India. The district combines traditional Sikkimese culture with modern development aspirations.',
            desc2: 'As a newly formed district, Pakyong is still developing its administrative infrastructure and public amenities. The establishment of the airport has boosted economic activity, but many areas still require basic facilities such as community centers, public toilets, healthcare units, and sports facilities. The community is actively engaged in planning and advocating for necessary infrastructure development.'
        },
        soreng: {
            name: 'Soreng District',
            region: 'West Sikkim',
            image: 'https://images.unsplash.com/photo-1613339027986-b94d85708995?w=800&q=80',
            desc1: 'Soreng is the newest district in Sikkim, formed in 2017 by bifurcating West Sikkim. The district is known for its lush green landscapes, cardamom plantations, and peaceful rural atmosphere. It includes important areas like Sombaria, Chumbong, and Daramdin, each with distinct community needs.',
            desc2: 'Being a newly formed district, Soreng faces the challenge of building administrative and public infrastructure from scratch. Many areas lack proper healthcare facilities, community gathering spaces, libraries, and recreational facilities. The local population is enthusiastic about participating in development planning and has shown strong community spirit in identifying and prioritizing amenity requests.'
        }
    };

    // Open district modal
    districtCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const districtKey = this.dataset.district;
            openDistrictModal(districtKey);
        });
    });

    function openDistrictModal(districtKey) {
        const data = districtData[districtKey];
        if (!data) return;

        // Populate modal with district info
        document.getElementById('districtModalImage').src = data.image;
        document.getElementById('districtModalImage').alt = data.name;
        document.getElementById('districtModalName').textContent = data.name;
        document.getElementById('districtModalRegion').textContent = data.region;
        document.getElementById('districtModalDesc1').textContent = data.desc1;
        document.getElementById('districtModalDesc2').textContent = data.desc2;

        // Reset stats
        document.getElementById('districtTotalRequests').textContent = '...';
        document.getElementById('districtPendingRequests').textContent = '...';
        document.getElementById('districtApprovedRequests').textContent = '...';

        // Show loading in requests list
        document.getElementById('districtRequestsList').innerHTML = '<div class="loading-spinner">Loading requests...</div>';

        // Show modal
        districtModal.style.display = 'block';

        // Fetch district requests
        fetchDistrictRequests(districtKey);
    }

    async function fetchDistrictRequests(districtKey) {
        // Convert key to proper district name
        const districtName = districtKey.charAt(0).toUpperCase() + districtKey.slice(1);

        try {
            const response = await fetch(`${API_BASE}/api/districts/${districtName}/requests`);
            const result = await response.json();

            if (result.success) {
                // Update stats
                document.getElementById('districtTotalRequests').textContent = result.stats.total;
                document.getElementById('districtPendingRequests').textContent = result.stats.pending;
                document.getElementById('districtApprovedRequests').textContent = result.stats.approved;

                // Display requests
                displayDistrictRequests(result.requests);
            }
        } catch (error) {
            console.error('Error fetching district requests:', error);
            document.getElementById('districtRequestsList').innerHTML = '<div class="no-requests">Unable to load requests. Please try again.</div>';
        }
    }

    function displayDistrictRequests(requests) {
        const container = document.getElementById('districtRequestsList');

        if (requests.length === 0) {
            container.innerHTML = '<div class="no-requests">No requests submitted yet for this district. Be the first to submit one!</div>';
            return;
        }

        container.innerHTML = requests.map(req => {
            const timeAgo = getTimeAgo(new Date(req.submittedAt));
            const statusClass = req.status.toLowerCase().replace(' ', '-');
            const priorityClass = req.priority.toLowerCase();

            return `
                <div class="district-request-item">
                    <div class="request-item-header">
                        <span class="request-name">${req.name}</span>
                        <span class="request-time">${timeAgo}</span>
                    </div>
                    <div class="request-item-body">
                        <div class="request-location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${req.location}
                        </div>
                        <div class="request-amenities">${req.amenities.join(', ')}</div>
                    </div>
                    <div class="request-item-footer">
                        <span class="status-tag status-${statusClass}">${req.status}</span>
                        <span class="priority-tag priority-${priorityClass}">${req.priority}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Close district modal
    if (districtClose) {
        districtClose.addEventListener('click', function() {
            districtModal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === districtModal) {
            districtModal.style.display = 'none';
        }
    });

    // Console log for debugging
    console.log('Sikkim Amenities Portal initialized');
    console.log('Backend API:', API_BASE + '/api');
});
