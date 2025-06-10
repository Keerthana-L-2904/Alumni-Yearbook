let slideIndex = 0;
let slides, dots;

function showSlides() {
    slides = document.getElementsByClassName("mySlides");
    dots = document.getElementsByClassName("dot");

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    // Increment and loop slide index
    slideIndex++;
    if (slideIndex > slides.length) { 
        slideIndex = 1; 
    }

    // Update dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");  
    }

    // Show current slide and activate dot
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].classList.add("active");
    
    // Change slide every 5 seconds
    setTimeout(showSlides, 5000);
}

function plusSlides(n) {
    // Clear the current timeout to prevent conflicts
    clearTimeout(window.slideTimeout);
    
    slideIndex += n;
    if (slideIndex > slides.length) { 
        slideIndex = 1; 
    } else if (slideIndex < 1) { 
        slideIndex = slides.length; 
    }
    
    // Manually show the selected slide
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        dots[i].classList.remove("active");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].classList.add("active");
    
    // Restart the slideshow timer
    window.slideTimeout = setTimeout(showSlides, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize slideshow
    showSlides();
    
    // Fetch and display news
    fetch('/api/admin/news')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(news => {
            const newsContainer = document.getElementById('latest-news-content');
            if (newsContainer && news.length > 0) {
                newsContainer.innerHTML = news.map(item => 
                    `<p><strong>${item.title}:</strong> ${item.content}</p>`
                ).join('');
            }
        })
        .catch(error => {
            console.error('Error loading news:', error);
            const newsContainer = document.getElementById('latest-news-content');
            if (newsContainer) {
                newsContainer.innerHTML = '<p>Failed to load news. Please try again later.</p>';
            }
        });

    // Fetch and display events
    fetch('/api/admin/events')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(events => {
            const eventsContainer = document.getElementById('upcoming-events-content');
            if (eventsContainer && events.length > 0) {
                eventsContainer.innerHTML = events.map(event => {
                    const eventDate = new Date(event.eventDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    return `<p><strong>${event.title} (${eventDate}):</strong> ${event.content}</p>`;
                }).join('');
            }
        })
        .catch(error => {
            console.error('Error loading events:', error);
            const eventsContainer = document.getElementById('upcoming-events-content');
            if (eventsContainer) {
                eventsContainer.innerHTML = '<p>Failed to load events. Please try again later.</p>';
            }
        });
const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');

if (error) {
const errorMessage = document.getElementById('error-message');
if (error === 'not_verified') {
    errorMessage.textContent = 'Your email is not registered as a verified alumni.';
} else if (error === 'server_error') {
    errorMessage.textContent = 'Server error occurred. Please try again.';
} else if (error === 'auth_failed') {
    errorMessage.textContent = 'Authentication failed. Please try again.';
}
}


});