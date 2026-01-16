document.addEventListener('DOMContentLoaded', function() {
    // Dynamic API URL - works on localhost and production
    const API_BASE = window.location.origin;

    // ==========================================
    // HERO BACKGROUND SLIDESHOW
    // ==========================================
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    function nextHeroSlide() {
        heroSlides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % heroSlides.length;
        heroSlides[currentSlide].classList.add('active');
    }

    // Change slide every 5 seconds
    if (heroSlides.length > 0) {
        setInterval(nextHeroSlide, 5000);
    }

    // ==========================================
    // SEARCH FUNCTIONALITY WITH AUTOCOMPLETE
    // ==========================================
    const searchInput = document.getElementById('headerSearchInput');
    const searchButton = document.querySelector('.search-box button');
    const searchSuggestions = document.getElementById('searchSuggestions');

    const searchableItems = [
        { name: 'Submit Request', desc: 'Submit a new amenity request', section: '#request-form', keywords: ['submit', 'request', 'form', 'amenity', 'new'], icon: 'file-plus' },
        { name: 'Track Status', desc: 'Check your request status', section: '#track', keywords: ['track', 'status', 'reference', 'id', 'check'], icon: 'clock' },
        { name: 'Guidelines', desc: 'How the process works', section: '#guidelines', keywords: ['guidelines', 'how', 'works', 'faq', 'help', 'process'], icon: 'book' },
        { name: 'Districts', desc: 'Explore Sikkim districts', section: '#districts', keywords: ['district', 'gangtok', 'mangan', 'namchi', 'gyalshing', 'pakyong', 'soreng'], icon: 'map-pin' },
        { name: 'Gym', desc: 'Request gym/fitness center', section: '#request-form', keywords: ['gym', 'fitness', 'exercise', 'workout'], icon: 'activity' },
        { name: 'Library', desc: 'Request library facility', section: '#request-form', keywords: ['library', 'books', 'reading'], icon: 'book-open' },
        { name: 'Public Toilet', desc: 'Request public toilet', section: '#request-form', keywords: ['toilet', 'bathroom', 'restroom', 'sanitation'], icon: 'home' },
        { name: 'Community Center', desc: 'Request community center', section: '#request-form', keywords: ['community', 'center', 'hall', 'gathering'], icon: 'users' },
        { name: 'Healthcare', desc: 'Request healthcare facility', section: '#request-form', keywords: ['health', 'hospital', 'clinic', 'medical', 'doctor'], icon: 'heart' },
        { name: 'Playground', desc: 'Request playground/park', section: '#request-form', keywords: ['playground', 'park', 'children', 'play'], icon: 'sun' },
        { name: 'Street Light', desc: 'Request street lighting', section: '#request-form', keywords: ['street', 'light', 'lighting', 'lamp'], icon: 'zap' },
        { name: 'Water Supply', desc: 'Request water facility', section: '#request-form', keywords: ['water', 'supply', 'drinking', 'tap'], icon: 'droplet' },
        { name: 'Stray Dog Vaccination', desc: 'Request vaccination drive', section: '#request-form', keywords: ['dog', 'stray', 'vaccination', 'animal', 'rabies'], icon: 'shield' },
        { name: 'Contact', desc: 'Get in touch with us', section: '.contact-card', keywords: ['contact', 'phone', 'email', 'whatsapp'], icon: 'mail' },
        { name: 'Volunteer', desc: 'Join volunteer network', section: '#volunteer', keywords: ['volunteer', 'help', 'join', 'contribute'], icon: 'user-plus' }
    ];

    // Icon SVG paths
    const iconPaths = {
        'file-plus': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15h6',
        'clock': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2',
        'book': 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
        'map-pin': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
        'activity': 'M22 12h-4l-3 9L9 3l-3 9H2',
        'book-open': 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
        'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
        'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
        'heart': 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
        'sun': 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
        'zap': 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
        'droplet': 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
        'shield': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
        'mail': 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
        'user-plus': 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M12.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M20 8v6 M23 11h-6'
    };

    // Show suggestions based on input
    function showSuggestions(query) {
        if (!query || query.length < 2) {
            searchSuggestions.style.display = 'none';
            return;
        }

        query = query.toLowerCase();
        const matches = [];

        searchableItems.forEach(item => {
            let score = 0;
            if (item.name.toLowerCase().includes(query)) score += 10;
            item.keywords.forEach(keyword => {
                if (keyword.includes(query) || query.includes(keyword)) score += 5;
            });
            if (score > 0) {
                matches.push({ ...item, score });
            }
        });

        matches.sort((a, b) => b.score - a.score);
        const topMatches = matches.slice(0, 6);

        if (topMatches.length > 0) {
            searchSuggestions.innerHTML = topMatches.map(item => `
                <div class="suggestion-item" data-section="${item.section}">
                    <svg class="suggestion-item-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="${iconPaths[item.icon] || iconPaths['file-plus']}"></path>
                    </svg>
                    <div class="suggestion-item-text">
                        <div class="suggestion-item-name">${item.name}</div>
                        <div class="suggestion-item-desc">${item.desc}</div>
                    </div>
                </div>
            `).join('');
            searchSuggestions.style.display = 'block';

            // Add click handlers to suggestions
            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', function() {
                    const section = this.dataset.section;
                    navigateToSection(section);
                    searchInput.value = '';
                    searchSuggestions.style.display = 'none';
                });
            });
        } else {
            searchSuggestions.style.display = 'none';
        }
    }

    // Navigate to section with highlight effect
    function navigateToSection(section) {
        const target = document.querySelector(section);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Flash highlight effect
            target.style.transition = 'box-shadow 0.3s';
            target.style.boxShadow = '0 0 20px rgba(0, 119, 162, 0.5)';
            setTimeout(() => {
                target.style.boxShadow = '';
            }, 2000);
        }
    }

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;

        // Hide suggestions
        searchSuggestions.style.display = 'none';

        // Find matching item
        let bestMatch = null;
        let bestScore = 0;

        searchableItems.forEach(item => {
            let score = 0;
            if (item.name.toLowerCase().includes(query)) score += 10;
            item.keywords.forEach(keyword => {
                if (keyword.includes(query) || query.includes(keyword)) score += 5;
            });
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        });

        if (bestMatch && bestScore > 0) {
            navigateToSection(bestMatch.section);
            searchInput.value = '';
        } else {
            alert('No results found. Try searching for: gym, library, track, districts, etc.');
        }
    }

    // Event listeners for search
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            showSuggestions(e.target.value);
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        searchInput.addEventListener('focus', function() {
            if (this.value.length >= 2) {
                showSuggestions(this.value);
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

    const form = document.getElementById('amenityForm');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const otherCheckbox = document.querySelector('input[name="amenity"][value="Other"]');
    const otherAmenityGroup = document.getElementById('otherAmenityGroup');
    const amenityCheckboxes = document.querySelectorAll('input[name="amenity"]');

    // ==========================================
    // GPU (Gram Panchayat Unit) DATA
    // ==========================================
    const gpuData = {
        'Gangtok': [
            'Aho Yangtam', 'Amba', 'Aritar', 'Assam Lingzey', 'Burtuk', 'Central Pendam',
            'Cha Misamari', 'Chandmari', 'Chujachen', 'Dalapchand', 'Duga', 'Gnathang Machong',
            'Kabi Tingda', 'Khamdong', 'Lingdok Nampong', 'Luing Perbing', 'Machong',
            'Martam Nazitam', 'Nandok', 'Navey Shotak', 'Niya Rongong', 'Pangthang',
            'Parkha', 'Parakha', 'Pathing', 'Penlong', 'Rakdong Tintek', 'Ranka',
            'Regu', 'Rey Mindu', 'Rhenock', 'Rumtek', 'Samdong Kambal', 'Sang',
            'Sirwani', 'Sudunglakha', 'Tanak Sajong', 'Tathangchen', 'Taza',
            'Timpyem', 'Upper Tadong', 'West Pendam'
        ],
        'Mangan': [
            'Chungthang', 'Dzongu', 'Hee Gyathang', 'Kabi Lungchok', 'Lachen',
            'Lachung', 'Lum Gor Sangtok', 'Mangan', 'Men Rongong', 'Namok Swayem',
            'Passingdong', 'Pentong', 'Phensong', 'Ramthang', 'Ringhim Nampatam',
            'Sakyong Pentong', 'Sentam', 'Shipgyer', 'Singhik', 'Tingchim',
            'Toong Naga', 'Upper Dzongu'
        ],
        'Namchi': [
            'Assangthang', 'Barfung Zarung', 'Ben Namprik', 'Boomtar', 'Chisopani',
            'Damthang', 'Jorethang Nayabazar', 'Kabrey Buriakhop', 'Kateng Pamphok',
            'Kewzing Bakhim', 'Lamting Tingmo', 'Lingmoo Payong', 'Mamley Kamrang',
            'Maneydara', 'Mellidara', 'Melli', 'Namchi', 'Namthang Maniram',
            'Namphing', 'Nandugaon', 'Omchung Ralong', 'Perbing Dovan', 'Poklok Denchung',
            'Ravangla', 'Rayong Sodang', 'Rishi Rabikhola', 'Salghari', 'Sikkip',
            'Singithang', 'Temi', 'Tendong', 'Tinkitam Rayong', 'Turuk Ramabong',
            'Upper Boomtar', 'Wak Omchu', 'Yangang'
        ],
        'Gyalshing': [
            'Arithang', 'Berfok', 'Bhareng', 'Buriakhop', 'Chakung',
            'Chongrang', 'Daramdin', 'Dentam', 'Gyalshing', 'Hee Martam',
            'Kaluk', 'Khecheopalri', 'Kongri', 'Labdang', 'Legship',
            'Lingchom', 'Lungzik', 'Maneybong', 'Naku Chumbong', 'Okhrey',
            'Pelling', 'Rinchenpong', 'Sangadorji', 'Siktam', 'Singyang Chumbung',
            'Sopakha', 'Tashiding', 'Timburbong', 'Uttarey', 'Yuksom', 'Yuksam Dubdi'
        ],
        'Pakyong': [
            'Aho Yangtam', 'Amba Dara', 'Dikling Karthok', 'Dung Dung Pakyong',
            'Latuk Machong', 'Lower Khamdong', 'Machong', 'Namcheybong',
            'Naitam Nandok', 'Pachey', 'Pakyong', 'Parkha', 'Pathing',
            'Rhenock', 'Riwa Parkha', 'Thekabung', 'Timing Namrang', 'West Pakyong'
        ],
        'Soreng': [
            'Chumbong', 'Daramdin', 'Gelling Barapathing', 'Hee', 'Kaluk Rinchenpong',
            'Karmatar', 'Malbasey', 'Melli Dara Paiyong', 'Naku Chumbong', 'Okhrey',
            'Reshi', 'Rinchenpong', 'Rumbuk', 'Salghari', 'Sombaria',
            'Soreng', 'Timburbong', 'Zoom'
        ]
    };

    // Populate GPU dropdown based on district selection
    const districtSelect = document.getElementById('district');
    const gpuSelect = document.getElementById('gpu');

    if (districtSelect && gpuSelect) {
        districtSelect.addEventListener('change', function() {
            const selectedDistrict = this.value;
            gpuSelect.innerHTML = '<option value="">-- Select GPU --</option>';

            if (selectedDistrict && gpuData[selectedDistrict]) {
                gpuData[selectedDistrict].forEach(gpu => {
                    const option = document.createElement('option');
                    option.value = gpu;
                    option.textContent = gpu;
                    gpuSelect.appendChild(option);
                });
            } else {
                gpuSelect.innerHTML = '<option value="">-- Select district first --</option>';
            }
        });
    }

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
        const phoneValue = document.getElementById('phone').value;
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: phoneValue.replace(/\D/g, ''), // Strip all non-digit characters
            district: document.getElementById('district').value,
            gpu: document.getElementById('gpu').value,
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

    // Phone number validation - Indian numbers only
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        // Allow only digits
        this.value = this.value.replace(/[^0-9]/g, '');

        // Limit to 10 digits
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }

        // Validate Indian phone number pattern (must start with 6-9)
        if (this.value.length > 0 && !['6', '7', '8', '9'].includes(this.value[0])) {
            this.setCustomValidity('Indian phone numbers must start with 6, 7, 8, or 9');
        } else if (this.value.length > 0 && this.value.length < 10) {
            this.setCustomValidity('Phone number must be exactly 10 digits');
        } else {
            this.setCustomValidity('');
        }
    });

    // Email validation
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function(e) {
        const email = this.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailPattern.test(email)) {
            this.setCustomValidity('Please enter a valid email address');
        } else {
            this.setCustomValidity('');
        }
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

    // ==========================================
    // FEEDBACK FORM FUNCTIONALITY
    // ==========================================

    const feedbackForm = document.getElementById('feedbackForm');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Collect feedback data
            const feedbackData = {
                name: document.getElementById('feedbackName').value,
                email: document.getElementById('feedbackEmail').value,
                type: document.getElementById('feedbackType').value,
                message: document.getElementById('feedbackMessage').value
            };

            // Show loading state
            const submitBtn = feedbackForm.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`${API_BASE}/api/feedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(feedbackData)
                });

                const result = await response.json();

                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                if (result.success) {
                    // Show success modal
                    showFeedbackSuccessModal(feedbackData, result.referenceId);
                    // Reset form
                    feedbackForm.reset();
                } else {
                    alert('Failed to submit feedback. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting feedback:', error);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                alert('Error: Could not connect to server. Please try again later.');
            }
        });
    }

    // Show feedback success modal
    function showFeedbackSuccessModal(data, referenceId) {
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');

        modalTitle.textContent = 'Thank You for Your Feedback!';
        modalMessage.innerHTML = `
            <div style="text-align: left; margin-top: 16px;">
                <p style="margin-bottom: 16px; font-size: 15px; color: #2c5f2d;">
                    We appreciate you taking the time to share your thoughts with us.
                </p>
                <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #0077a2;">Reference ID:</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 700; color: #005a7d; font-family: monospace;">
                        ${referenceId}
                    </p>
                </div>
                <div style="background: #f8f9fa; padding: 14px; border-radius: 6px; border-left: 3px solid #0077a2;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #555;">Feedback Type:</p>
                    <p style="margin: 0 0 12px 0; color: #333;">${data.type}</p>
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #555;">Your Message:</p>
                    <p style="margin: 0; color: #333; line-height: 1.5;">${data.message}</p>
                </div>
                <p style="margin-top: 16px; font-size: 14px; color: #666;">
                    Your feedback has been recorded and will be reviewed by our team. Thank you for helping us improve!
                </p>
            </div>
        `;

        modal.style.display = 'block';
    }

    // ==========================================
    // DISTRICTS CAROUSEL
    // ==========================================
    const carouselSlides = document.querySelectorAll('.districts-carousel .district-card');
    const carouselPrevBtn = document.querySelector('.carousel-btn-prev');
    const carouselNextBtn = document.querySelector('.carousel-btn-next');
    const carouselIndicators = document.querySelectorAll('.carousel-indicators .indicator');
    let currentCarouselIndex = 0;

    function showDistrictSlide(index) {
        // Remove active class from all cards and indicators
        carouselSlides.forEach(card => card.classList.remove('active'));
        carouselIndicators.forEach(indicator => indicator.classList.remove('active'));

        // Add active class to current slide and indicator
        carouselSlides[index].classList.add('active');
        carouselIndicators[index].classList.add('active');
    }

    function nextDistrictSlide() {
        currentCarouselIndex = (currentCarouselIndex + 1) % carouselSlides.length;
        showDistrictSlide(currentCarouselIndex);
    }

    function prevDistrictSlide() {
        currentCarouselIndex = (currentCarouselIndex - 1 + carouselSlides.length) % carouselSlides.length;
        showDistrictSlide(currentCarouselIndex);
    }

    // Event listeners for carousel buttons
    if (carouselNextBtn) {
        carouselNextBtn.addEventListener('click', nextDistrictSlide);
    }

    if (carouselPrevBtn) {
        carouselPrevBtn.addEventListener('click', prevDistrictSlide);
    }

    // Event listeners for indicators
    carouselIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentCarouselIndex = index;
            showDistrictSlide(index);
        });
    });

    // Auto-advance carousel every 5 seconds
    if (carouselSlides.length > 0) {
        setInterval(nextDistrictSlide, 5000);
    }

    // Keyboard navigation for carousel
    document.addEventListener('keydown', (e) => {
        // Only respond to arrow keys if not in a form input
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft') {
                prevDistrictSlide();
            } else if (e.key === 'ArrowRight') {
                nextDistrictSlide();
            }
        }
    });

    // ==========================================
    // MOBILE DROPDOWN MENU FIX
    // ==========================================
    const dropdownToggles = document.querySelectorAll('.has-dropdown > a');

    // Handle click/touch on dropdown toggles for mobile
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Only handle on touch devices or small screens
            if ('ontouchstart' in window || window.innerWidth <= 768) {
                const parentLi = this.parentElement;
                const isOpen = parentLi.classList.contains('dropdown-open');

                // Close all other dropdowns
                document.querySelectorAll('.has-dropdown').forEach(item => {
                    item.classList.remove('dropdown-open');
                });

                // Toggle current dropdown
                if (!isOpen) {
                    e.preventDefault();
                    parentLi.classList.add('dropdown-open');
                } else {
                    // On second click, allow navigation if link has href
                    if (this.getAttribute('href') === '#') {
                        e.preventDefault();
                    }
                }
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.has-dropdown')) {
            document.querySelectorAll('.has-dropdown').forEach(item => {
                item.classList.remove('dropdown-open');
            });
        }
    });

    // Console log for debugging
    console.log('Sikkim Amenities Portal initialized');
    console.log('Backend API:', API_BASE + '/api');
});
