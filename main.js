/**
 * Neopy - Main JavaScript File
 * Features:
 * - Sidebar toggle for mobile navigation
 * - Smooth scroll for "Get Started" button
 * - Glowing card animations on hover
 * - General UI functionality shared across pages
 * - Modal handling, tab switching, and dynamic content loading
 */

// ============================================
// DOM Ready Event Listener
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Initialize all components
    initSidebar();
    initSmoothScroll();
    initGlowingCards();
    initMobileMenu();
    initModals();
    initTabs();
    initAIFeatures();
    initScrollReveal();
    initFormValidation();
    initBackToTop();
    
    console.log('Neopy - UI initialized successfully 🚀');
});

// ============================================
// SIDEBAR TOGGLE (Mobile Navigation)
// ============================================
function initSidebar() {
    const menuToggle = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('mobileSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const overlay = document.getElementById('overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    
    // Function to open sidebar
    function openSidebar() {
        if (sidebar) {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Add aria-label for accessibility
            sidebar.setAttribute('aria-hidden', 'false');
        }
    }
    
    // Function to close sidebar
    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
            if (sidebar) sidebar.setAttribute('aria-hidden', 'true');
        }
    }
    
    // Event listeners
    if (menuToggle) {
        menuToggle.addEventListener('click', openSidebar);
    }
    
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Close sidebar when clicking on a link
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Check if it's an anchor link
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                // Let smooth scroll handle it, then close sidebar
                setTimeout(closeSidebar, 100);
            } else {
                closeSidebar();
            }
        });
    });
    
    // Close sidebar on window resize (if screen becomes desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

// ============================================
// SMOOTH SCROLL for "Get Started" Button
// ============================================
function initSmoothScroll() {
    // Get Started button
    const getStartedBtn = document.getElementById('getStartedBtn');
    const coursesBtn = document.querySelector('.btn-get-started');
    const allSmoothLinks = document.querySelectorAll('a[href^="#"]');
    
    // Smooth scroll function
    function smoothScrollTo(target, duration = 800) {
        const element = document.querySelector(target);
        if (!element) return;
        
        const startPosition = window.pageYOffset;
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function easeInOutCubic(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        }
        
        requestAnimationFrame(animation);
    }
    
    // Handle Get Started button
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Navigate to courses page or scroll to courses section
            const coursesPage = document.querySelector('.tabs-container');
            if (coursesPage) {
                smoothScrollTo('.tabs-container');
            } else {
                // If on homepage, scroll to features or navigate to courses page
                window.location.href = '/courses.html';
            }
        });
    }
    
    // Handle any other Get Started buttons
    if (coursesBtn && coursesBtn !== getStartedBtn) {
        coursesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/courses.html';
        });
    }
    
    // Smooth scroll for all anchor links
    allSmoothLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    smoothScrollTo(`#${targetId}`);
                }
            }
        });
    });
    
    // Handle navigation links from sidebar and navbar
    const navLinks = document.querySelectorAll('.navbar a, .sidebar a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    smoothScrollTo(`#${targetId}`);
                }
            }
        });
    });
}

// ============================================
// GLOWING CARDS ANIMATION on Hover
// ============================================
function initGlowingCards() {
    const cards = document.querySelectorAll('.glow-card, .feature-card, .topic-card, .project-card');
    
    cards.forEach(card => {
        // Add mouse enter animation
        card.addEventListener('mouseenter', function(e) {
            // Create ripple effect on hover
            const ripple = document.createElement('div');
            ripple.classList.add('card-ripple');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = 'rgba(249, 115, 22, 0.3)';
            ripple.style.pointerEvents = 'none';
            ripple.style.width = '0';
            ripple.style.height = '0';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.transition = 'all 0.6s ease-out';
            ripple.style.zIndex = '1';
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            card.style.position = 'relative';
            card.style.overflow = 'hidden';
            card.appendChild(ripple);
            
            setTimeout(() => {
                ripple.style.width = '300px';
                ripple.style.height = '300px';
                ripple.style.opacity = '0';
            }, 10);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Add glow animation on hover
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
        });
    });
    
    // Add intersection observer for cards to animate on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    };
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                cardObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    cards.forEach(card => {
        cardObserver.observe(card);
    });
}

// ============================================
// MOBILE MENU HANDLING
// ============================================
function initMobileMenu() {
    const menuIcon = document.querySelector('.menu-icon');
    const body = document.body;
    
    // Add touch-friendly classes
    if ('ontouchstart' in window) {
        body.classList.add('touch-device');
    }
    
    // Handle menu icon click for mobile
    if (menuIcon) {
        menuIcon.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Adjust sidebar position on orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            const sidebar = document.getElementById('mobileSidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                // Recalculate sidebar position
                sidebar.style.left = '0';
            }
        }, 100);
    });
}

// ============================================
// MODAL HANDLING (AI Modal)
// ============================================
function initModals() {
    const aiFab = document.getElementById('aiFabBtn');
    const aiModal = document.getElementById('aiModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Open modal function
    function openModal(modal) {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Add keyboard trap for accessibility
            modal.setAttribute('aria-hidden', 'false');
        }
    }
    
    // Close modal function
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            modal.setAttribute('aria-hidden', 'true');
        }
    }
    
    // AI Button click handler
    if (aiFab && aiModal) {
        aiFab.addEventListener('click', function() {
            openModal(aiModal);
            // Optional: Load AI content dynamically
            if (typeof loadAIContent === 'function') {
                loadAIContent();
            }
        });
    }
    
    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.ai-modal');
            if (modal) closeModal(modal);
        });
    });
    
    // Close modal on overlay click
    const modals = document.querySelectorAll('.ai-modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    closeModal(modal);
                }
            });
        }
    });
}

// ============================================
// TABS HANDLING (Courses Page)
// ============================================
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (tabs.length === 0) return;
    
    function switchTab(activeTab) {
        const level = activeTab.getAttribute('data-level');
        
        // Update active class on tabs
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        activeTab.classList.add('active');
        
        // Trigger custom event for content loading
        const event = new CustomEvent('tabChanged', {
            detail: { level: level }
        });
        document.dispatchEvent(event);
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            switchTab(this);
        });
    });
    
    // Initialize first tab as active if none is active
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab && tabs[0]) {
        tabs[0].classList.add('active');
    }
}

// ============================================
// AI FEATURES (Lazy Loading)
// ============================================
function initAIFeatures() {
    const askAIButton = document.getElementById('askAIButton');
    const aiResponseArea = document.getElementById('aiResponseArea');
    
    if (askAIButton && aiResponseArea) {
        askAIButton.addEventListener('click', async function() {
            // Show loading state
            aiResponseArea.innerHTML = '<div class="loading-spinner"></div> Analyzing your learning path...';
            
            // Simulate AI response (replace with actual API call)
            setTimeout(() => {
                const currentLevel = getCurrentLevel();
                const suggestions = getAISuggestions(currentLevel);
                aiResponseArea.innerHTML = `
                    <i class="fas fa-robot" style="color: var(--orange);"></i>
                    <strong>AI Mentor says:</strong> ${suggestions}
                    <br><br>
                    <i class="fas fa-lightbulb"></i> Keep coding consistently!
                `;
            }, 800);
        });
    }
}

function getCurrentLevel() {
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        return activeTab.getAttribute('data-level') || 'beginner';
    }
    return 'beginner';
}

function getAISuggestions(level) {
    const suggestions = {
        beginner: 'Start with Python fundamentals, practice mini-games, and focus on problem-solving. I recommend building a simple calculator app to solidify syntax and logic.',
        intermediate: 'Deepen your OOP knowledge, master API integrations, and build a portfolio project like a Weather Dashboard or Blog API. Consider learning Flask for backend development.',
        pro: 'Explore concurrency patterns, ML deployment strategies, and cloud architecture. Try building a real-time chat application with WebSockets or deploy an ML model with Docker.',
        'ai-integration': 'Focus on TensorFlow/PyTorch fundamentals, experiment with pre-trained models, and build an AI-powered application. Start with a sentiment analyzer or image classifier project.'
    };
    return suggestions[level] || suggestions.beginner;
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.glow-card, .feature-card, .topic-card, .project-card, .section-title, .quote-block');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });
    
    // Add revealed class styles
    const style = document.createElement('style');
    style.textContent = `
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// FORM VALIDATION (if any forms exist)
// ============================================
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Add error message
                    let errorMsg = field.parentElement.querySelector('.error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('small');
                        errorMsg.className = 'error-message';
                        errorMsg.style.color = 'var(--red-accent)';
                        errorMsg.style.fontSize = '0.75rem';
                        errorMsg.style.marginTop = '0.25rem';
                        field.parentElement.appendChild(errorMsg);
                    }
                    errorMsg.textContent = 'This field is required';
                    
                    // Remove error on input
                    field.addEventListener('input', function() {
                        this.classList.remove('error');
                        const msg = this.parentElement.querySelector('.error-message');
                        if (msg) msg.remove();
                    });
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
}

// ============================================
// BACK TO TOP BUTTON
// ============================================
function initBackToTop() {
    // Create button if it doesn't exist
    let backToTop = document.getElementById('backToTop');
    
    if (!backToTop) {
        backToTop = document.createElement('button');
        backToTop.id = 'backToTop';
        backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTop.style.position = 'fixed';
        backToTop.style.bottom = '2rem';
        backToTop.style.left = '2rem';
        backToTop.style.width = '45px';
        backToTop.style.height = '45px';
        backToTop.style.borderRadius = '50%';
        backToTop.style.backgroundColor = 'var(--orange)';
        backToTop.style.border = 'none';
        backToTop.style.color = 'var(--dark-bg)';
        backToTop.style.cursor = 'pointer';
        backToTop.style.display = 'none';
        backToTop.style.alignItems = 'center';
        backToTop.style.justifyContent = 'center';
        backToTop.style.fontSize = '1.2rem';
        backToTop.style.transition = 'all 0.3s ease';
        backToTop.style.zIndex = '99';
        backToTop.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.4)';
        
        document.body.appendChild(backToTop);
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        backToTop.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        backToTop.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'flex';
        } else {
            backToTop.style.display = 'none';
        }
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Add window resize handler with debounce
window.addEventListener('resize', debounce(function() {
    console.log('Window resized - adjusting UI');
    // Recalculate any dynamic elements if needed
}, 250));

// Add scroll handler with throttle
window.addEventListener('scroll', throttle(function() {
    // Add scroll-based effects if needed
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.pageYOffset > 50) {
            navbar.style.background = 'rgba(12, 11, 11, 0.95)';
            navbar.style.backdropFilter = 'blur(16px)';
        } else {
            navbar.style.background = 'rgba(12, 11, 11, 0.85)';
        }
    }
}, 100));

// ============================================
// EXPORT FOR MODULE USE (if needed)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSidebar,
        initSmoothScroll,
        initGlowingCards,
        initTabs
    };
}
