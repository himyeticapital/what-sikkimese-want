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

    // Console log for debugging
    console.log('Sikkim Amenities Portal initialized');
    console.log('Backend API:', API_BASE + '/api');
});
