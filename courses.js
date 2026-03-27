/**
 * Neopy Courses Page JavaScript
 * Features:
 * - Dynamically load topics from JSON files (beginner.json, intermediate.json, pro.json)
 * - Render topics in collapsible sections with smooth animations
 * - Render sample projects at the bottom
 * - Handle expand/collapse animations for topics
 * - AI modal integration with lazy loading
 */

// ============================================
// Global Variables
// ============================================
let currentLevel = 'beginner';
let courseData = {
    beginner: null,
    intermediate: null,
    pro: null
};
let aiScriptLoaded = false;
let activeAccordion = null;

// ============================================
// DOM Ready Event Listener
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Initialize the courses page
    initCoursesPage();
    
    // Initialize tabs
    initTabs();
    
    // Initialize AI modal with lazy loading
    initAIModal();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    console.log('Neopy Courses Page - Initialized 🎓');
});

// ============================================
// Initialize Courses Page
// ============================================
async function initCoursesPage() {
    try {
        // Show loading state
        showLoadingState();
        
        // Load all JSON data in parallel
        await loadAllCourseData();
        
        // Load initial level (beginner)
        await loadLevel(currentLevel);
        
        // Hide loading state
        hideLoadingState();
        
    } catch (error) {
        console.error('Error initializing courses page:', error);
        showErrorMessage('Failed to load course data. Please refresh the page.');
        hideLoadingState();
    }
}

// ============================================
// Load All Course Data from JSON Files
// ============================================
async function loadAllCourseData() {
    const levels = ['beginner', 'intermediate', 'pro'];
    const promises = levels.map(level => loadCourseData(level));
    
    await Promise.all(promises);
}

async function loadCourseData(level) {
    try {
        const response = await fetch(`${level}.json`);
        
        if (!response.ok) {
            throw new Error(`Failed to load ${level}.json (Status: ${response.status})`);
        }
        
        const data = await response.json();
        courseData[level] = data;
        console.log(`✅ Loaded ${level}.json successfully`);
        
    } catch (error) {
        console.warn(`⚠️ Could not load ${level}.json, using fallback data`);
        courseData[level] = getFallbackData(level);
    }
}

// ============================================
// Fallback Data (in case JSON files are missing)
// ============================================
function getFallbackData(level) {
    const fallbackData = {
        beginner: {
            title: "Beginner Python Course",
            description: "Start your Python journey from scratch with these fundamental topics.",
            topics: [
                {
                    id: "beginner-1",
                    title: "Python Basics",
                    description: "Learn variables, data types, and basic operations.",
                    duration: "2 hours",
                    difficulty: "Easy",
                    lessons: ["Variables & Data Types", "Basic Operators", "Strings", "Numbers", "Input/Output"],
                    completed: false
                },
                {
                    id: "beginner-2",
                    title: "Control Flow",
                    description: "Master conditionals and loops to control program flow.",
                    duration: "3 hours",
                    difficulty: "Easy",
                    lessons: ["If-Else Statements", "For Loops", "While Loops", "Break & Continue", "List Comprehensions"],
                    completed: false
                },
                {
                    id: "beginner-3",
                    title: "Data Structures",
                    description: "Explore Python's built-in data structures.",
                    duration: "4 hours",
                    difficulty: "Intermediate",
                    lessons: ["Lists", "Tuples", "Dictionaries", "Sets", "Stacks & Queues"],
                    completed: false
                },
                {
                    id: "beginner-4",
                    title: "Functions & Modules",
                    description: "Write reusable code with functions and modules.",
                    duration: "3 hours",
                    difficulty: "Intermediate",
                    lessons: ["Function Definition", "Parameters & Arguments", "Return Values", "Scope", "Modules & Imports"],
                    completed: false
                }
            ],
            projects: [
                {
                    id: "proj-1",
                    name: "Calculator App",
                    description: "Build a command-line calculator with basic arithmetic operations.",
                    tech: "Python Basics",
                    difficulty: "Beginner",
                    image: "calculator-icon",
                    features: ["Addition", "Subtraction", "Multiplication", "Division", "Error Handling"]
                },
                {
                    id: "proj-2",
                    name: "To-Do List Manager",
                    description: "Create a task management system with file storage.",
                    tech: "File I/O, Lists",
                    difficulty: "Beginner",
                    image: "todo-icon",
                    features: ["Add Tasks", "Delete Tasks", "Mark Complete", "Save to File", "Load Tasks"]
                },
                {
                    id: "proj-3",
                    name: "Number Guessing Game",
                    description: "Interactive game where users guess a random number.",
                    tech: "Random Module, Loops",
                    difficulty: "Beginner",
                    image: "game-icon",
                    features: ["Random Number Generation", "Score Tracking", "Difficulty Levels", "Hints System"]
                }
            ]
        },
        intermediate: {
            title: "Intermediate Python Course",
            description: "Level up your Python skills with advanced concepts and real-world applications.",
            topics: [
                {
                    id: "intermediate-1",
                    title: "Object-Oriented Programming",
                    description: "Deep dive into classes, inheritance, and polymorphism.",
                    duration: "5 hours",
                    difficulty: "Intermediate",
                    lessons: ["Classes & Objects", "Inheritance", "Polymorphism", "Magic Methods", "Decorators"],
                    completed: false
                },
                {
                    id: "intermediate-2",
                    title: "API Integration",
                    description: "Learn to consume REST APIs and work with JSON data.",
                    duration: "4 hours",
                    difficulty: "Intermediate",
                    lessons: ["HTTP Methods", "Requests Library", "JSON Parsing", "Authentication", "Error Handling"],
                    completed: false
                },
                {
                    id: "intermediate-3",
                    title: "Database Management",
                    description: "Work with SQL databases using SQLite and SQLAlchemy.",
                    duration: "5 hours",
                    difficulty: "Advanced",
                    lessons: ["SQL Basics", "SQLite Operations", "SQLAlchemy ORM", "Database Design", "Query Optimization"],
                    completed: false
                }
            ],
            projects: [
                {
                    id: "proj-4",
                    name: "Weather Dashboard",
                    description: "Fetch and display real-time weather data from OpenWeather API.",
                    tech: "API, Requests, JSON",
                    difficulty: "Intermediate",
                    image: "weather-icon",
                    features: ["API Integration", "Data Visualization", "Search by City", "Weather Forecast"]
                },
                {
                    id: "proj-5",
                    name: "Blog API Backend",
                    description: "Build a RESTful API for a blog platform using Flask.",
                    tech: "Flask, SQLAlchemy, JWT",
                    difficulty: "Intermediate",
                    image: "api-icon",
                    features: ["CRUD Operations", "User Authentication", "Database Models", "API Documentation"]
                }
            ]
        },
        pro: {
            title: "Professional Python Course",
            description: "Master advanced Python concepts used by industry professionals.",
            topics: [
                {
                    id: "pro-1",
                    title: "Concurrency & Parallelism",
                    description: "Master threading, multiprocessing, and async programming.",
                    duration: "6 hours",
                    difficulty: "Advanced",
                    lessons: ["Threading", "Multiprocessing", "AsyncIO", "Coroutines", "Parallel Processing"],
                    completed: false
                },
                {
                    id: "pro-2",
                    title: "Design Patterns",
                    description: "Implement proven design patterns in Python.",
                    duration: "5 hours",
                    difficulty: "Advanced",
                    lessons: ["Singleton", "Factory", "Observer", "Strategy", "Decorator Pattern"],
                    completed: false
                },
                {
                    id: "pro-3",
                    title: "Microservices Architecture",
                    description: "Build scalable microservices with FastAPI and Docker.",
                    duration: "7 hours",
                    difficulty: "Expert",
                    lessons: ["FastAPI Basics", "Docker Containers", "Service Discovery", "API Gateway", "Message Queues"],
                    completed: false
                }
            ],
            projects: [
                {
                    id: "proj-6",
                    name: "Real-time Chat Application",
                    description: "Build a WebSocket-based chat app with async Python.",
                    tech: "WebSockets, AsyncIO, Redis",
                    difficulty: "Advanced",
                    image: "chat-icon",
                    features: ["Real-time Messaging", "User Rooms", "Message History", "Online Status"]
                },
                {
                    id: "proj-7",
                    name: "AI-Powered Image Classifier",
                    description: "Deploy a deep learning model for image classification.",
                    tech: "TensorFlow, FastAPI, Docker",
                    difficulty: "Expert",
                    image: "ai-icon",
                    features: ["Model Training", "API Endpoint", "Image Upload", "Real-time Inference"]
                }
            ]
        }
    };
    
    return fallbackData[level];
}

// ============================================
// Load Specific Level
// ============================================
async function loadLevel(level) {
    currentLevel = level;
    const data = courseData[level];
    
    if (!data) {
        console.error(`No data found for level: ${level}`);
        return;
    }
    
    // Render topics with collapsible sections
    renderTopics(data.topics);
    
    // Render projects
    renderProjects(data.projects);
    
    // Update page title and description
    updatePageHeader(data);
}

// ============================================
// Render Topics with Collapsible Sections
// ============================================
function renderTopics(topics) {
    const topicsContainer = document.getElementById('topicsContainer');
    
    if (!topicsContainer) return;
    
    if (!topics || topics.length === 0) {
        topicsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No topics available for this level.</p>
            </div>
        `;
        return;
    }
    
    // Create topics HTML with collapsible sections
    const topicsHTML = `
        <div class="topics-wrapper">
            <div class="section-header">
                <h2><i class="fas fa-book-open"></i> Learning Topics</h2>
                <p>Click on any topic to expand and explore detailed lessons</p>
            </div>
            <div class="accordion-container">
                ${topics.map((topic, index) => `
                    <div class="accordion-item" data-topic-id="${topic.id}">
                        <div class="accordion-header" onclick="toggleAccordion('${topic.id}')">
                            <div class="accordion-title">
                                <i class="fas fa-chevron-right accordion-icon"></i>
                                <h3>${escapeHtml(topic.title)}</h3>
                            </div>
                            <div class="accordion-meta">
                                <span class="topic-duration"><i class="far fa-clock"></i> ${topic.duration}</span>
                                <span class="topic-difficulty difficulty-${topic.difficulty.toLowerCase()}">${topic.difficulty}</span>
                            </div>
                        </div>
                        <div class="accordion-content" id="accordion-content-${topic.id}">
                            <div class="topic-description">
                                <p>${escapeHtml(topic.description)}</p>
                            </div>
                            <div class="lessons-list">
                                <h4><i class="fas fa-list-ul"></i> What You'll Learn</h4>
                                <ul>
                                    ${topic.lessons ? topic.lessons.map(lesson => `
                                        <li><i class="fas fa-check-circle"></i> ${escapeHtml(lesson)}</li>
                                    `).join('') : '<li>Detailed lessons coming soon</li>'}
                                </ul>
                            </div>
                            <div class="topic-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${topic.completed ? '100%' : '0%'}"></div>
                                </div>
                                <button class="btn-mark-complete" onclick="markTopicComplete('${topic.id}')">
                                    <i class="fas fa-check"></i> Mark as Complete
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    topicsContainer.innerHTML = topicsHTML;
    
    // Add CSS for accordion if not present
    addAccordionStyles();
}

// ============================================
// Toggle Accordion (Expand/Collapse)
// ============================================
function toggleAccordion(topicId) {
    const content = document.getElementById(`accordion-content-${topicId}`);
    const accordionItem = document.querySelector(`.accordion-item[data-topic-id="${topicId}"]`);
    const icon = accordionItem.querySelector('.accordion-icon');
    
    if (!content) return;
    
    // Close all other accordions (optional - can be modified for multiple open)
    const allContents = document.querySelectorAll('.accordion-content');
    const allIcons = document.querySelectorAll('.accordion-icon');
    
    if (content.classList.contains('active')) {
        // Collapse current
        content.classList.remove('active');
        content.style.maxHeight = null;
        icon.style.transform = 'rotate(0deg)';
    } else {
        // Close all others first
        allContents.forEach(item => {
            item.classList.remove('active');
            item.style.maxHeight = null;
        });
        allIcons.forEach(icn => {
            icn.style.transform = 'rotate(0deg)';
        });
        
        // Expand current
        content.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(90deg)';
        
        // Smooth scroll to accordion if needed
        setTimeout(() => {
            if (accordionItem && isElementInViewport(accordionItem)) {
                accordionItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }
}

// ============================================
// Mark Topic as Complete
// ============================================
function markTopicComplete(topicId) {
    const data = courseData[currentLevel];
    if (!data) return;
    
    const topic = data.topics.find(t => t.id === topicId);
    if (topic) {
        topic.completed = !topic.completed;
        
        // Update UI
        const accordionItem = document.querySelector(`.accordion-item[data-topic-id="${topicId}"]`);
        const progressFill = accordionItem.querySelector('.progress-fill');
        const completeBtn = accordionItem.querySelector('.btn-mark-complete');
        
        if (topic.completed) {
            progressFill.style.width = '100%';
            completeBtn.innerHTML = '<i class="fas fa-undo"></i> Undo Complete';
            completeBtn.classList.add('completed');
            showNotification('✅ Topic marked as complete!', 'success');
        } else {
            progressFill.style.width = '0%';
            completeBtn.innerHTML = '<i class="fas fa-check"></i> Mark as Complete';
            completeBtn.classList.remove('completed');
            showNotification('Topic progress updated', 'info');
        }
        
        // Save progress to localStorage
        saveProgress();
    }
}

// ============================================
// Save Progress to localStorage
// ============================================
function saveProgress() {
    const progress = {
        beginner: courseData.beginner?.topics.map(t => ({ id: t.id, completed: t.completed })),
        intermediate: courseData.intermediate?.topics.map(t => ({ id: t.id, completed: t.completed })),
        pro: courseData.pro?.topics.map(t => ({ id: t.id, completed: t.completed }))
    };
    
    localStorage.setItem('neopy_progress', JSON.stringify(progress));
    console.log('Progress saved to localStorage');
}

// ============================================
// Load Progress from localStorage
// ============================================
function loadProgress() {
    const savedProgress = localStorage.getItem('neopy_progress');
    if (!savedProgress) return;
    
    try {
        const progress = JSON.parse(savedProgress);
        
        Object.keys(progress).forEach(level => {
            if (courseData[level] && progress[level]) {
                progress[level].forEach(savedTopic => {
                    const topic = courseData[level].topics.find(t => t.id === savedTopic.id);
                    if (topic) {
                        topic.completed = savedTopic.completed;
                    }
                });
            }
        });
        
        console.log('Progress loaded from localStorage');
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// ============================================
// Render Projects at the Bottom
// ============================================
function renderProjects(projects) {
    const projectsContainer = document.getElementById('projectsContainer');
    
    if (!projectsContainer) return;
    
    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-flask"></i>
                <p>Sample projects coming soon!</p>
            </div>
        `;
        return;
    }
    
    const projectsHTML = `
        <div class="projects-wrapper">
            <div class="section-header">
                <h2><i class="fas fa-laptop-code"></i> Sample Projects</h2>
                <p>Apply your knowledge with these hands-on projects</p>
            </div>
            <div class="projects-grid">
                ${projects.map(project => `
                    <div class="project-card glowing-card" data-project-id="${project.id}">
                        <div class="project-icon">
                            <i class="fas ${getProjectIcon(project.image)}"></i>
                        </div>
                        <h3>${escapeHtml(project.name)}</h3>
                        <p>${escapeHtml(project.description)}</p>
                        <div class="project-meta">
                            <span class="project-tech"><i class="fas fa-microchip"></i> ${escapeHtml(project.tech)}</span>
                            <span class="project-difficulty difficulty-${project.difficulty.toLowerCase()}">${project.difficulty}</span>
                        </div>
                        <div class="project-features">
                            <h4>Key Features:</h4>
                            <ul>
                                ${project.features ? project.features.map(feature => `
                                    <li><i class="fas fa-star"></i> ${escapeHtml(feature)}</li>
                                `).join('') : '<li>Interactive learning experience</li>'}
                            </ul>
                        </div>
                        <button class="btn-start-project" onclick="startProject('${project.id}')">
                            <i class="fas fa-play"></i> Start Project
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    projectsContainer.innerHTML = projectsHTML;
}

// ============================================
// Get Project Icon
// ============================================
function getProjectIcon(iconName) {
    const icons = {
        'calculator-icon': 'fa-calculator',
        'todo-icon': 'fa-tasks',
        'game-icon': 'fa-gamepad',
        'weather-icon': 'fa-cloud-sun',
        'api-icon': 'fa-code-branch',
        'chat-icon': 'fa-comments',
        'ai-icon': 'fa-robot',
        'default': 'fa-project-diagram'
    };
    
    return icons[iconName] || icons.default;
}

// ============================================
// Start Project Handler
// ============================================
function startProject(projectId) {
    showNotification('🚀 Project starter kit will be available soon!', 'info');
    console.log(`Starting project: ${projectId}`);
}

// ============================================
// Initialize Tabs
// ============================================
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (!tabs.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const level = this.getAttribute('data-level');
            if (!level) return;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show loading state
            showLoadingState();
            
            // Load new level
            await loadLevel(level);
            
            // Hide loading state
            hideLoadingState();
        });
    });
}

// ============================================
// Update Page Header
// ============================================
function updatePageHeader(data) {
    const headerTitle = document.querySelector('.page-title');
    const headerDesc = document.querySelector('.page-description');
    
    if (headerTitle && data.title) {
        headerTitle.textContent = data.title;
    }
    
    if (headerDesc && data.description) {
        headerDesc.textContent = data.description;
    }
}

// ============================================
// AI Modal with Lazy Loading
// ============================================
function initAIModal() {
    const aiFab = document.getElementById('aiFabBtn');
    const aiModal = document.getElementById('aiModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const askAIButton = document.getElementById('askAIButton');
    const aiResponseArea = document.getElementById('aiResponseArea');
    
    if (!aiFab || !aiModal) return;
    
    // Open modal and lazy load AI JS
    aiFab.addEventListener('click', async function() {
        openModal(aiModal);
        
        // Lazy load AI JS only when clicked
        if (!aiScriptLoaded) {
            await loadAIScript();
        }
    });
    
    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => closeModal(aiModal));
    }
    
    // Close on overlay click
    aiModal.addEventListener('click', (e) => {
        if (e.target === aiModal) closeModal(aiModal);
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aiModal.classList.contains('active')) {
            closeModal(aiModal);
        }
    });
    
    // Handle AI question
    if (askAIButton && aiResponseArea) {
        askAIButton.addEventListener('click', async () => {
            if (!aiScriptLoaded) {
                await loadAIScript();
            }
            
            // Show loading
            aiResponseArea.innerHTML = '<div class="loading-spinner"></div> Analyzing your learning path...';
            
            // Simulate AI response (will be enhanced by external AI JS if loaded)
            setTimeout(() => {
                const suggestions = getAISuggestions(currentLevel);
                aiResponseArea.innerHTML = `
                    <div class="ai-response-content">
                        <i class="fas fa-robot" style="color: var(--orange); font-size: 1.2rem;"></i>
                        <strong>AI Mentor says:</strong>
                        <p>${suggestions}</p>
                        <div class="ai-tip">
                            <i class="fas fa-lightbulb"></i> Tip: Practice daily for best results!
                        </div>
                    </div>
                `;
            }, 800);
        });
    }
}

// ============================================
// Load AI Script Dynamically (Lazy Loading)
// ============================================
async function loadAIScript() {
    return new Promise((resolve, reject) => {
        if (aiScriptLoaded) {
            resolve();
            return;
        }
        
        // Create script element for AI functionality
        const script = document.createElement('script');
        script.src = 'ai-assistant.js'; // External AI JS file
        script.async = true;
        
        script.onload = () => {
            console.log('✅ AI Assistant JS loaded successfully');
            aiScriptLoaded = true;
            
            // Trigger any AI initialization
            if (typeof initAIAssistant === 'function') {
                initAIAssistant();
            }
            
            resolve();
        };
        
        script.onerror = () => {
            console.warn('⚠️ External AI JS not found, using built-in AI features');
            aiScriptLoaded = true; // Mark as loaded to prevent retries
            resolve(); // Resolve anyway to use fallback
        };
        
        document.head.appendChild(script);
        
        // Timeout fallback
        setTimeout(() => {
            if (!aiScriptLoaded) {
                console.warn('AI script load timeout, using fallback');
                aiScriptLoaded = true;
                resolve();
            }
        }, 3000);
    });
}

// ============================================
// Get AI Suggestions Based on Current Level
// ============================================
function getAISuggestions(level) {
    const suggestions = {
        beginner: "🎯 Focus on mastering the fundamentals: variables, loops, and functions. I recommend starting with the Calculator project to build confidence. Practice coding at least 30 minutes daily for steady progress!",
        intermediate: "🚀 Level up by building real-world projects! Try the Weather Dashboard to master API integration. Don't forget to practice OOP concepts and database design. You're on the right track!",
        pro: "💡 Advanced topics like concurrency and design patterns are your playground. The Real-time Chat project will help you master async programming. Consider contributing to open source to sharpen your skills!",
        'ai-integration': "🤖 Great choice! Start with TensorFlow basics and build the Image Classifier project. Remember to understand the fundamentals before diving into complex architectures. Keep experimenting!"
    };
    
    return suggestions[level] || suggestions.beginner;
}

// ============================================
// Utility Functions
// ============================================

// Show loading state
function showLoadingState() {
    const topicsContainer = document.getElementById('topicsContainer');
    const projectsContainer = document.getElementById('projectsContainer');
    
    if (topicsContainer) {
        topicsContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading course content...</p>
            </div>
        `;
    }
    
    if (projectsContainer) {
        projectsContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading projects...</p>
            </div>
        `;
    }
}

// Hide loading state
function hideLoadingState() {
    // Loading state will be replaced by content in render functions
}

// Show error message
function showErrorMessage(message) {
    const topicsContainer = document.getElementById('topicsContainer');
    if (topicsContainer) {
        topicsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${escapeHtml(message)}</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = type === 'success' ? 'var(--dark-green)' : 'var(--grey-mid)';
    notification.style.color = 'var(--cream)';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '9999';
    notification.style.animation = 'slideIn 0.3s ease';
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Open modal
function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Smooth scroll
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// Add accordion styles dynamically
function addAccordionStyles() {
    if (document.getElementById('accordion-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'accordion-styles';
    style.textContent = `
        .accordion-container {
            width: 100%;
            margin: 2rem 0;
        }
        
        .accordion-item {
            background: var(--card-bg);
            border: 1px solid rgba(249, 115, 22, 0.2);
            border-radius: 12px;
            margin-bottom: 1rem;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .accordion-item:hover {
            border-color: var(--orange);
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
        }
        
        .accordion-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.2rem 1.5rem;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .accordion-header:hover {
            background: rgba(249, 115, 22, 0.05);
        }
        
        .accordion-title {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1;
        }
        
        .accordion-title h3 {
            margin: 0;
            font-size: 1.1rem;
        }
        
        .accordion-icon {
            transition: transform 0.3s ease;
            color: var(--orange);
        }
        
        .accordion-meta {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .topic-duration, .topic-difficulty {
            font-size: 0.85rem;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            background: rgba(249, 115, 22, 0.1);
        }
        
        .difficulty-easy {
            color: #4caf50;
            background: rgba(76, 175, 80, 0.1);
        }
        
        .difficulty-intermediate {
            color: #ff9800;
            background: rgba(255, 152, 0, 0.1);
        }
        
        .difficulty-advanced, .difficulty-expert {
            color: #f44336;
            background: rgba(244, 67, 54, 0.1);
        }
        
        .accordion-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 0 1.5rem;
        }
        
        .accordion-content.active {
            max-height: 800px;
            padding: 1rem 1.5rem 1.5rem;
        }
        
        .topic-description {
            margin-bottom: 1rem;
        }
        
        .lessons-list ul {
            list-style: none;
            padding: 0;
        }
        
        .lessons-list li {
            padding: 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .lessons-list li i {
            color: var(--orange);
        }
        
        .topic-progress {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .progress-bar {
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 1rem;
        }
        
        .progress-fill {
            height: 100%;
            background: var(--orange);
            transition: width 0.3s ease;
        }
        
        .btn-mark-complete {
            background: rgba(249, 115, 22, 0.2);
            border: 1px solid var(--orange);
            color: var(--orange);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-mark-complete:hover {
            background: var(--orange);
            color: var(--dark-bg);
        }
        
        .btn-mark-complete.completed {
            background: var(--dark-green);
            border-color: var(--dark-green);
            color: var(--cream);
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Make functions globally accessible for onclick handlers
window.toggleAccordion = toggleAccordion;
window.markTopicComplete = markTopicComplete;
window.startProject = startProject;
