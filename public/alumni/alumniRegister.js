
verifyBtn.style.display = 'inline-block';  // or 'block' depending on layout
checkStatusBtn.style.display = 'inline-block';
homepageBtn.style.display = 'inline-block';

verifyBtn.disabled = false;
checkStatusBtn.disabled = false;
homepageBtn.disabled = false;
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const registrationForm = document.getElementById('alumniRegistrationForm');
    const verifyBtn = document.getElementById('verifyBtn');
    const checkStatusBtn = document.getElementById('checkStatusBtn');
    const homepageBtn = document.getElementById('homepageBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('collegeId');
    const statusDisplay = document.getElementById('statusDisplay');
    const uploadStatus = document.getElementById('uploadStatus');
    
    // State management
    
    let fileUploaded = false;

    // Event Listeners
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    
    // Modified verify button handler

    verifyBtn.addEventListener('click', async function (event) {
        await handleVerification(event); // Wait for verification
        event.preventDefault();
        event.stopImmediatePropagation();
    });

    checkStatusBtn.addEventListener('click', async function (event) {
        await checkAlumniStatus(event);
        event.preventDefault();
        event.stopImmediatePropagation();
    });
    let formData = new FormData(); // Global shared FormData

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit');
            return;
        }

        if (!file.type.match('image.*')) {
            alert('Please upload an image file');
            return;
        }

        formData.set('collegeId', file); // Use set() to replace if exists
        uploadStatus.textContent = '✓ Uploaded';
        uploadStatus.style.color = 'green';
    }
}

async function handleVerification(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    // Get all form values
    formData.set('name', document.getElementById('name').value);
    formData.set('email', document.getElementById('email').value);
    formData.set('phone', document.getElementById('phone').value);
    formData.set('occupation', document.getElementById('occupation').value);
    formData.set('company', document.getElementById('company').value);
    formData.set('graduationYear', document.getElementById('graduationYear').value);

    try {
        const response = await fetch('http://localhost:5000/registerAlumni', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error('Unexpected response: ' + text.slice(0, 100));
        }

        const data = await response.json();
        if (response.ok) {
            statusDisplay.textContent = 'Registration submitted for admin approval!';
            statusDisplay.style.color = 'green';
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error("Registration error:", error);
        statusDisplay.textContent = `Error: ${error.message}`;
        statusDisplay.style.color = 'red';
    }
}

    async function checkAlumniStatus(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const email = document.getElementById('email').value.trim();
        if (!email) {
            alert('Please enter your email to check status');
            return;
        }

        checkStatusBtn.textContent = 'Checking...';

        try {
            const response = await fetch(`http://localhost:5000/api/alumni/statusAlumni?email=${encodeURIComponent(email)}`);
            
            if (!response.ok) {
                throw new Error('Failed to check status');
            }
            
            const data = await response.json();
            if (data.message === 'Alumni not found') {
                statusDisplay.textContent = 'Registration not found. Please register first.';
                statusDisplay.style.color = 'red';
            } else if (data.isApproved) {
                statusDisplay.textContent = '✓ Approved! You can now access alumni features.';
                statusDisplay.style.color = 'green';

            } else if (data.isRejected) {
                statusDisplay.textContent = '✗ Rejected. Please contact admin for details.';
                statusDisplay.style.color = 'red';
            } else {
                statusDisplay.textContent = '⏳ Waiting for admin approval...';
                statusDisplay.style.color = 'blue';
            }
            
        } catch (error) {
            console.error('Status check error:', error);
            statusDisplay.textContent = `Error checking status: ${error.message}`;
            statusDisplay.style.color = 'red';
        } finally {
            checkStatusBtn.textContent = 'Check Status';
        }
    }
});