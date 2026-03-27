/**
 * Neopy AI Integration Module
 * Features:
 * - Dynamic modal creation with textarea, send button, response div, and close button
 * - Lazy loading - only loads when user clicks "Ask AI" button
 * - API integration with '/api/ask' endpoint
 * - Clean, responsive modal design with animations
 */

// ============================================
// AI Module - IIFE Pattern
// ============================================
const NeopyAI = (function() {
    'use strict';
    
    // Private variables
    let aiModal = null;
    let isModalCreated = false;
    let isInitialized = false;
    let currentSessionId = null;
    let conversationHistory = [];
    
    // Configuration
    const config = {
        apiEndpoint: '/api/ask',
        modalId: 'neopy-ai-modal',
        maxHistoryLength: 20,
        requestTimeout: 30000, // 30 seconds
        retryAttempts: 3
    };
    
    // ============================================
    // Create Modal Dynamically
    // ============================================
    function createModal() {
        if (isModalCreated) return;
        
        // Create modal container
        const modal = document.createElement('div');
        modal.id = config.modalId;
        modal.className = 'neopy-ai-modal';
        modal.setAttribute('aria-hidden', 'true');
        
        // Modal structure
        modal.innerHTML = `
            <div class="neopy-ai-modal-overlay"></div>
            <div class="neopy-ai-modal-container">
                <div class="neopy-ai-modal-header">
                    <div class="neopy-ai-header-left">
                        <div class="neopy-ai-icon">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div>
                            <h2>Neopy AI Assistant</h2>
                            <p>Your Python learning companion</p>
                        </div>
                    </div>
                    <button class="neopy-ai-close-btn" aria-label="Close AI Assistant">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="neopy-ai-modal-body">
                    <div class="neopy-ai-conversation" id="ai-conversation">
                        <div class="ai-welcome-message">
                            <div class="ai-message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="ai-message-content">
                                <p>Hello! I'm your Neopy AI mentor. I can help you with Python concepts, debugging, project ideas, and learning paths. What would you like to know?</p>
                                <div class="ai-suggestions">
                                    <button class="ai-suggestion-chip" data-prompt="What's the best way to learn Python?">Best way to learn Python</button>
                                    <button class="ai-suggestion-chip" data-prompt="Explain OOP in simple terms">Explain OOP simply</button>
                                    <button class="ai-suggestion-chip" data-prompt="How to debug Python code?">Debugging tips</button>
                                    <button class="ai-suggestion-chip" data-prompt="Python project ideas for beginners">Project ideas</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="neopy-ai-input-area">
                        <div class="ai-input-wrapper">
                            <textarea 
                                id="ai-prompt-input" 
                                placeholder="Ask me anything about Python, courses, or programming..."
                                rows="2"
                                maxlength="2000"
                            ></textarea>
                            <div class="ai-input-actions">
                                <div class="ai-input-info">
                                    <span id="char-counter">0</span>/2000
                                    <button class="ai-clear-conversation" title="Clear conversation">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                                <button id="ai-send-btn" class="ai-send-btn" disabled>
                                    <i class="fas fa-paper-plane"></i>
                                    <span>Send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add CSS styles
        addModalStyles();
        
        // Store reference
        aiModal = modal;
        isModalCreated = true;
        
        // Attach event listeners
        attachModalEvents();
        
        console.log('✅ AI Modal created dynamically');
    }
    
    // ============================================
    // Add Modal Styles
    // ============================================
    function addModalStyles() {
        if (document.getElementById('neopy-ai-styles')) return;
        
        const styles = `
            <style id="neopy-ai-styles">
                /* Modal Container */
                .neopy-ai-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    visibility: hidden;
                    opacity: 0;
                    transition: visibility 0.3s ease, opacity 0.3s ease;
                }
                
                .neopy-ai-modal.active {
                    visibility: visible;
                    opacity: 1;
                }
                
                /* Overlay */
                .neopy-ai-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(12px);
                }
                
                /* Modal Container */
                .neopy-ai-modal-container {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #1a1a1a 0%, #0c0b0b 100%);
                    border-radius: 24px 24px 0 0;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    animation: slideUp 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
                    border-top: 2px solid var(--orange, #f97316);
                    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
                }
                
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                
                /* Modal Header */
                .neopy-ai-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 1.8rem;
                    border-bottom: 1px solid rgba(249, 115, 22, 0.2);
                    background: rgba(18, 18, 18, 0.95);
                    border-radius: 24px 24px 0 0;
                }
                
                .neopy-ai-header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .neopy-ai-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, var(--orange, #f97316), #d9480f);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: pulse 2s infinite;
                }
                
                .neopy-ai-icon i {
                    font-size: 1.5rem;
                    color: #fff;
                }
                
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 0 10px rgba(249, 115, 22, 0);
                    }
                }
                
                .neopy-ai-modal-header h2 {
                    margin: 0;
                    font-size: 1.3rem;
                    color: var(--cream, #faf3e0);
                }
                
                .neopy-ai-modal-header p {
                    margin: 0;
                    font-size: 0.8rem;
                    color: var(--orange, #f97316);
                }
                
                .neopy-ai-close-btn {
                    background: none;
                    border: none;
                    color: var(--cream, #faf3e0);
                    font-size: 1.5rem;
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .neopy-ai-close-btn:hover {
                    background: rgba(249, 115, 22, 0.2);
                    transform: rotate(90deg);
                    color: var(--orange, #f97316);
                }
                
                /* Modal Body */
                .neopy-ai-modal-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    padding: 0;
                }
                
                /* Conversation Area */
                .neopy-ai-conversation {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    max-height: 55vh;
                }
                
                /* Message Styles */
                .ai-welcome-message,
                .ai-message-user,
                .ai-message-assistant {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    animation: fadeIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .ai-message-avatar {
                    width: 36px;
                    height: 36px;
                    background: rgba(249, 115, 22, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .ai-message-user .ai-message-avatar {
                    background: rgba(26, 59, 47, 0.2);
                }
                
                .ai-message-avatar i {
                    font-size: 1rem;
                    color: var(--orange, #f97316);
                }
                
                .ai-message-user .ai-message-avatar i {
                    color: var(--dark-green, #1a3b2f);
                }
                
                .ai-message-content {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.8rem 1rem;
                    border-radius: 12px;
                    line-height: 1.5;
                }
                
                .ai-message-user .ai-message-content {
                    background: rgba(249, 115, 22, 0.1);
                    border-left: 3px solid var(--orange, #f97316);
                }
                
                .ai-message-assistant .ai-message-content {
                    border-left: 3px solid var(--dark-green, #1a3b2f);
                }
                
                .ai-message-content p {
                    margin: 0 0 0.5rem 0;
                }
                
                .ai-message-content p:last-child {
                    margin-bottom: 0;
                }
                
                .ai-message-time {
                    font-size: 0.7rem;
                    color: #888;
                    margin-top: 0.5rem;
                    display: block;
                }
                
                /* Suggestions */
                .ai-suggestions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                
                .ai-suggestion-chip {
                    background: rgba(249, 115, 22, 0.15);
                    border: 1px solid rgba(249, 115, 22, 0.3);
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: var(--cream, #faf3e0);
                }
                
                .ai-suggestion-chip:hover {
                    background: var(--orange, #f97316);
                    color: #0c0b0b;
                    transform: translateY(-2px);
                }
                
                /* Input Area */
                .neopy-ai-input-area {
                    padding: 1rem 1.5rem 1.5rem;
                    border-top: 1px solid rgba(249, 115, 22, 0.2);
                    background: rgba(12, 11, 11, 0.95);
                }
                
                .ai-input-wrapper {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    border: 1px solid rgba(249, 115, 22, 0.3);
                    transition: all 0.3s ease;
                }
                
                .ai-input-wrapper:focus-within {
                    border-color: var(--orange, #f97316);
                    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
                }
                
                #ai-prompt-input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    padding: 1rem;
                    color: var(--cream, #faf3e0);
                    font-family: inherit;
                    font-size: 0.95rem;
                    resize: vertical;
                    outline: none;
                }
                
                #ai-prompt-input::placeholder {
                    color: #888;
                }
                
                .ai-input-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 1rem 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .ai-input-info {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.75rem;
                    color: #888;
                }
                
                .ai-clear-conversation {
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .ai-clear-conversation:hover {
                    color: var(--red-accent, #e63946);
                }
                
                .ai-send-btn {
                    background: linear-gradient(135deg, var(--orange, #f97316), #d9480f);
                    border: none;
                    padding: 0.5rem 1.2rem;
                    border-radius: 20px;
                    color: #0c0b0b;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .ai-send-btn:hover:not(:disabled) {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
                }
                
                .ai-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                /* Loading Animation */
                .ai-loading {
                    display: flex;
                    gap: 0.3rem;
                    padding: 0.5rem 0;
                }
                
                .ai-loading span {
                    width: 8px;
                    height: 8px;
                    background: var(--orange, #f97316);
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                
                .ai-loading span:nth-child(1) { animation-delay: -0.32s; }
                .ai-loading span:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    }
                    40% {
                        transform: scale(1);
                    }
                }
                
                /* Scrollbar */
                .neopy-ai-conversation::-webkit-scrollbar {
                    width: 6px;
                }
                
                .neopy-ai-conversation::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }
                
                .neopy-ai-conversation::-webkit-scrollbar-thumb {
                    background: var(--orange, #f97316);
                    border-radius: 3px;
                }
                
                /* Responsive */
                @media (min-width: 768px) {
                    .neopy-ai-modal-container {
                        top: 50%;
                        left: 50%;
                        right: auto;
                        bottom: auto;
                        transform: translate(-50%, -50%);
                        width: 600px;
                        max-height: 80vh;
                        border-radius: 24px;
                        animation: fadeInScale 0.3s ease;
                    }
                    
                    @keyframes fadeInScale {
                        from {
                            opacity: 0;
                            transform: translate(-50%, -50%) scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1);
                        }
                    }
                    
                    .neopy-ai-modal-header {
                        border-radius: 24px 24px 0 0;
                    }
                }
                
                @media (max-width: 768px) {
                    .neopy-ai-modal-container {
                        bottom: 0;
                        left: 0;
                        right: 0;
                        border-radius: 24px 24px 0 0;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    // ============================================
    // Attach Modal Event Listeners
    // ============================================
    function attachModalEvents() {
        if (!aiModal) return;
        
        // Close button
        const closeBtn = aiModal.querySelector('.neopy-ai-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Overlay click
        const overlay = aiModal.querySelector('.neopy-ai-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }
        
        // Send button
        const sendBtn = document.getElementById('ai-send-btn');
        const textarea = document.getElementById('ai-prompt-input');
        const charCounter = document.getElementById('char-counter');
        const clearBtn = aiModal.querySelector('.ai-clear-conversation');
        
        if (sendBtn && textarea) {
            sendBtn.addEventListener('click', () => sendMessage());
            textarea.addEventListener('input', handleTextareaInput);
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (sendBtn.disabled === false) {
                        sendMessage();
                    }
                }
            });
            
            // Character counter
            if (charCounter) {
                textarea.addEventListener('input', () => {
                    const length = textarea.value.length;
                    charCounter.textContent = length;
                    sendBtn.disabled = length === 0 || length > 2000;
                });
            }
        }
        
        // Clear conversation
        if (clearBtn) {
            clearBtn.addEventListener('click', clearConversation);
        }
        
        // Suggestion chips
        const suggestionChips = aiModal.querySelectorAll('.ai-suggestion-chip');
        suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.getAttribute('data-prompt');
                if (prompt && textarea) {
                    textarea.value = prompt;
                    if (charCounter) charCounter.textContent = prompt.length;
                    if (sendBtn) sendBtn.disabled = false;
                    textarea.focus();
                }
            });
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && aiModal.classList.contains('active')) {
                closeModal();
            }
        });
    }
    
    // ============================================
    // Handle Textarea Input
    // ============================================
    function handleTextareaInput(e) {
        const textarea = e.target;
        const sendBtn = document.getElementById('ai-send-btn');
        
        // Auto-resize textarea
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
        
        // Enable/disable send button
        if (sendBtn) {
            sendBtn.disabled = textarea.value.trim().length === 0;
        }
    }
    
    // ============================================
    // Send Message to API
    // ============================================
    async function sendMessage() {
        const textarea = document.getElementById('ai-prompt-input');
        const prompt = textarea.value.trim();
        
        if (!prompt) return;
        
        // Disable input while processing
        const sendBtn = document.getElementById('ai-send-btn');
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i><span>Sending</span>';
        }
        
        // Add user message to conversation
        addMessageToConversation('user', prompt);
        
        // Clear input
        textarea.value = '';
        if (document.getElementById('char-counter')) {
            document.getElementById('char-counter').textContent = '0';
        }
        textarea.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Call API with retry logic
            const response = await callAPIWithRetry(prompt);
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add AI response
            addMessageToConversation('assistant', response.message, response.sessionId);
            
            // Save session ID
            if (response.sessionId) {
                currentSessionId = response.sessionId;
            }
            
            // Add to history
            conversationHistory.push({
                role: 'user',
                content: prompt,
                timestamp: new Date().toISOString()
            });
            conversationHistory.push({
                role: 'assistant',
                content: response.message,
                timestamp: new Date().toISOString()
            });
            
            // Trim history if needed
            if (conversationHistory.length > config.maxHistoryLength * 2) {
                conversationHistory = conversationHistory.slice(-config.maxHistoryLength * 2);
            }
            
        } catch (error) {
            console.error('AI API Error:', error);
            removeTypingIndicator();
            addMessageToConversation('assistant', `I apologize, but I encountered an error: ${error.message}. Please try again later.`);
        } finally {
            // Re-enable send button
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Send</span>';
            }
        }
    }
    
    // ============================================
    // Call API with Retry Logic
    // ============================================
    async function callAPIWithRetry(prompt, attempt = 1) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);
            
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': currentSessionId || '',
                    'X-Request-ID': generateRequestId()
                },
                body: JSON.stringify({
                    prompt: prompt,
                    sessionId: currentSessionId,
                    context: {
                        page: window.location.pathname,
                        level: getCurrentLevel(),
                        history: conversationHistory.slice(-6) // Send last 3 exchanges
                    }
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success && data.error) {
                throw new Error(data.error);
            }
            
            return {
                message: data.response || data.message || 'I received your message but no response was generated.',
                sessionId: data.sessionId,
                success: true
            };
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please try again.');
            }
            
            if (attempt < config.retryAttempts) {
                console.log(`Retrying... Attempt ${attempt + 1}`);
                await delay(1000 * attempt);
                return callAPIWithRetry(prompt, attempt + 1);
            }
            
            throw error;
        }
    }
    
    // ============================================
    // Add Message to Conversation
    // ============================================
    function addMessageToConversation(role, content, sessionId = null) {
        const conversationDiv = document.getElementById('ai-conversation');
        if (!conversationDiv) return;
        
        const timestamp = new Date();
        const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message-${role}`;
        messageDiv.innerHTML = `
            <div class="ai-message-avatar">
                <i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="ai-message-content">
                ${formatMessageContent(content)}
                <span class="ai-message-time">${timeStr}</span>
            </div>
        `;
        
        conversationDiv.appendChild(messageDiv);
        
        // Scroll to bottom
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }
    
    // ============================================
    // Format Message Content (Markdown-like)
    // ============================================
    function formatMessageContent(content) {
        if (!content) return '';
        
        // Convert markdown-like syntax
        let formatted = content
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Bold
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // Line breaks
            .replace(/\n/g, '<br>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        return `<p>${formatted}</p>`;
    }
    
    // ============================================
    // Show Typing Indicator
    // ============================================
    function showTypingIndicator() {
        const conversationDiv = document.getElementById('ai-conversation');
        if (!conversationDiv) return;
        
        // Remove existing indicator
        removeTypingIndicator();
        
        const indicatorDiv = document.createElement('div');
        indicatorDiv.id = 'ai-typing-indicator';
        indicatorDiv.className = 'ai-message-assistant';
        indicatorDiv.innerHTML = `
            <div class="ai-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">
                <div class="ai-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        conversationDiv.appendChild(indicatorDiv);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }
    
    // ============================================
    // Remove Typing Indicator
    // ============================================
    function removeTypingIndicator() {
        const indicator = document.getElementById('ai-typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // ============================================
    // Clear Conversation
    // ============================================
    function clearConversation() {
        if (confirm('Clear the entire conversation history?')) {
            const conversationDiv = document.getElementById('ai-conversation');
            if (conversationDiv) {
                // Keep only welcome message
                conversationDiv.innerHTML = `
                    <div class="ai-welcome-message">
                        <div class="ai-message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="ai-message-content">
                            <p>Conversation cleared. How can I help you with your Python learning journey?</p>
                            <div class="ai-suggestions">
                                <button class="ai-suggestion-chip" data-prompt="What's the best way to learn Python?">Best way to learn Python</button>
                                <button class="ai-suggestion-chip" data-prompt="Explain OOP in simple terms">Explain OOP simply</button>
                                <button class="ai-suggestion-chip" data-prompt="How to debug Python code?">Debugging tips</button>
                                <button class="ai-suggestion-chip" data-prompt="Python project ideas for beginners">Project ideas</button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Reattach suggestion chip events
                const suggestionChips = conversationDiv.querySelectorAll('.ai-suggestion-chip');
                suggestionChips.forEach(chip => {
                    chip.addEventListener('click', () => {
                        const prompt = chip.getAttribute('data-prompt');
                        const textarea = document.getElementById('ai-prompt-input');
                        if (prompt && textarea) {
                            textarea.value = prompt;
                            const charCounter = document.getElementById('char-counter');
                            if (charCounter) charCounter.textContent = prompt.length;
                            const sendBtn = document.getElementById('ai-send-btn');
                            if (sendBtn) sendBtn.disabled = false;
                            textarea.focus();
                        }
                    });
                });
            }
            
            // Reset conversation history
            conversationHistory = [];
            currentSessionId = null;
        }
    }
    
    // ============================================
    // Open Modal
    // ============================================
    function openModal() {
        if (!isModalCreated) {
            createModal();
        }
        
        if (aiModal) {
            aiModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on textarea
            setTimeout(() => {
                const textarea = document.getElementById('ai-prompt-input');
                if (textarea) textarea.focus();
            }, 300);
        }
    }
    
    // ============================================
    // Close Modal
    // ============================================
    function closeModal() {
        if (aiModal) {
            aiModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // ============================================
    // Toggle Modal
    // ============================================
    function toggleModal() {
        if (aiModal && aiModal.classList.contains('active')) {
            closeModal();
        } else {
            openModal();
        }
    }
    
    // ============================================
    // Ask AI Programmatically
    // ============================================
    async function askAI(prompt) {
        // Ensure modal is created
        if (!isModalCreated) {
            createModal();
        }
        
        // Open modal
        openModal();
        
        // Set prompt in textarea
        setTimeout(() => {
            const textarea = document.getElementById('ai-prompt-input');
            if (textarea) {
                textarea.value = prompt;
                const charCounter = document.getElementById('char-counter');
                if (charCounter) charCounter.textContent = prompt.length;
                const sendBtn = document.getElementById('ai-send-btn');
                if (sendBtn) sendBtn.disabled = false;
                
                // Auto-send if desired
                sendMessage();
            }
        }, 500);
    }
    
    // ============================================
    // Get Current Learning Level
    // ============================================
    function getCurrentLevel() {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            return activeTab.getAttribute('data-level') || 'beginner';
        }
        return 'beginner';
    }
    
    // ============================================
    // Utility Functions
    // ============================================
    function generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ============================================
    // Initialize AI Module
    // ============================================
    function init() {
        if (isInitialized) return;
        
        // Check if we should create modal immediately or wait
        const aiButton = document.getElementById('aiFabBtn');
        
        if (aiButton) {
            // Replace existing button click handler to use our modal
            const originalClick = aiButton.onclick;
            aiButton.onclick = (e) => {
                if (originalClick) originalClick.call(aiButton, e);
                openModal();
            };
        }
        
        isInitialized = true;
        console.log('🤖 Neopy AI Integration initialized');
    }
    
    // ============================================
    // Public API
    // ============================================
    return {
        init: init,
        askAI: askAI,
        openModal: openModal,
        closeModal: closeModal,
        toggleModal: toggleModal,
        clearConversation: clearConversation
    };
    
})();

// ============================================
// Auto-initialize when DOM is ready
// ============================================
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            NeopyAI.init();
        });
    } else {
        NeopyAI.init();
    }
}

// ============================================
// Export for module usage
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeopyAI;
}

if (typeof window !== 'undefined') {
    window.NeopyAI = NeopyAI;
}
