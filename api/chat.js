/**
 * Neopy AI Chat Backend - Express Server
 * 
 * Features:
 * - POST endpoint '/api/ask' for AI chat
 * - OpenAI GPT-4 integration with environment variable API key
 * - Error handling with appropriate status codes
 * - Session management support
 * - Rate limiting for production
 * - Ready for Vercel serverless deployment
 * 
 * Environment Variables Required:
 * - OPENAI_API_KEY: Your OpenAI API key
 * - OPENAI_MODEL: (optional) Model to use (defaults to gpt-4)
 * - MAX_TOKENS: (optional) Max tokens per response (default: 500)
 * - TEMPERATURE: (optional) Response creativity (default: 0.7)
 * - RATE_LIMIT_WINDOW_MS: (optional) Rate limit window (default: 60000)
 * - RATE_LIMIT_MAX_REQUESTS: (optional) Max requests per window (default: 50)
 */

// ============================================
// Dependencies
// ============================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { OpenAI } = require('openai');
require('dotenv').config();

// ============================================
// Configuration
// ============================================
const app = express();
const PORT = process.env.PORT || 3001;

// OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Model configuration
const MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS) || 500;
const TEMPERATURE = parseFloat(process.env.TEMPERATURE) || 0.7;

// Session storage (in-memory for serverless, consider Redis for production)
const sessions = new Map();

// ============================================
// Middleware
// ============================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : ['http://localhost:3000', 'http://localhost:5500', 'https://neopy.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Session-ID', 'X-Request-ID']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (for debugging)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', {
        'x-session-id': req.headers['x-session-id'],
        'x-request-id': req.headers['x-request-id']
    });
    next();
});

// Rate limiting (protect against abuse)
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50, // 50 requests per minute
    message: {
        success: false,
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/ask', limiter);

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a system prompt based on context
 */
function generateSystemPrompt(context = {}) {
    const { page, level, history } = context;
    
    let systemPrompt = `You are Neopy AI, a friendly and knowledgeable Python programming mentor. 
Your goal is to help users learn Python programming, from beginner concepts to advanced topics like AI integration.

Key characteristics:
- Be concise but thorough in explanations
- Use analogies and examples when helpful
- Encourage hands-on coding practice
- Provide code snippets with proper formatting using markdown code blocks
- If you're not sure about something, be honest and suggest resources

Current context:
- User is on page: ${page || 'unknown'}
- Learning level: ${level || 'beginner'}
- Previous interactions: ${history ? history.length : 0} messages`;

    return systemPrompt;
}

/**
 * Format conversation history for OpenAI
 */
function formatConversationHistory(history = [], currentPrompt) {
    const messages = [];
    
    // Add system prompt
    messages.push({
        role: 'system',
        content: generateSystemPrompt()
    });
    
    // Add conversation history (last 6 exchanges)
    const recentHistory = history.slice(-12); // Limit to last 6 exchanges (12 messages)
    recentHistory.forEach(msg => {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        });
    });
    
    // Add current prompt
    messages.push({
        role: 'user',
        content: currentPrompt
    });
    
    return messages;
}

/**
 * Validate request body
 */
function validateRequest(body) {
    const errors = [];
    
    if (!body.prompt || typeof body.prompt !== 'string') {
        errors.push('prompt is required and must be a string');
    }
    
    if (body.prompt && body.prompt.length > 2000) {
        errors.push('prompt exceeds maximum length of 2000 characters');
    }
    
    if (body.prompt && body.prompt.trim().length === 0) {
        errors.push('prompt cannot be empty');
    }
    
    return errors;
}

/**
 * Get or create session
 */
function getSession(sessionId) {
    if (!sessionId) {
        sessionId = generateSessionId();
    }
    
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
            id: sessionId,
            createdAt: new Date().toISOString(),
            history: [],
            metadata: {}
        });
        
        // Clean up old sessions periodically (keep last 1000)
        if (sessions.size > 1000) {
            const oldestSessions = Array.from(sessions.keys()).slice(0, 200);
            oldestSessions.forEach(key => sessions.delete(key));
        }
    }
    
    return sessions.get(sessionId);
}

/**
 * Generate a unique session ID
 */
function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate a unique request ID
 */
function generateRequestId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Sanitize response content
 */
function sanitizeResponse(content) {
    // Remove any sensitive information
    let sanitized = content
        .replace(/sk-[A-Za-z0-9-_]+/g, '[REDACTED]') // Remove API keys
        .replace(/\b\d{16}\b/g, '[REDACTED]') // Remove credit card numbers
        .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, (match) => {
            // Keep emails but obfuscate if they look like personal emails
            if (match.includes('gmail') || match.includes('yahoo') || match.includes('outlook')) {
                return match.replace(/(.{3})(.*)(@)/, '$1***$3');
            }
            return match;
        });
    
    return sanitized;
}

/**
 * Check if OpenAI API key is configured
 */
function isOpenAIConfigured() {
    return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';
}

// ============================================
// API Routes
// ============================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        openai: isOpenAIConfigured() ? 'configured' : 'missing',
        model: MODEL
    });
});

/**
 * POST /api/ask - Main AI chat endpoint
 */
app.post('/api/ask', async (req, res) => {
    const startTime = Date.now();
    let requestId = req.headers['x-request-id'] || generateRequestId();
    
    try {
        // Validate OpenAI configuration
        if (!isOpenAIConfigured()) {
            console.error('OpenAI API key not configured');
            return res.status(503).json({
                success: false,
                error: 'AI service is temporarily unavailable. Please try again later.',
                code: 'SERVICE_UNAVAILABLE',
                requestId
            });
        }
        
        // Validate request body
        const validationErrors = validateRequest(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                details: validationErrors,
                code: 'VALIDATION_ERROR',
                requestId
            });
        }
        
        const { prompt, sessionId: clientSessionId, context = {} } = req.body;
        
        // Get or create session
        const session = getSession(clientSessionId);
        const sessionId = session.id;
        
        // Update session metadata
        if (context.page) session.metadata.lastPage = context.page;
        if (context.level) session.metadata.level = context.level;
        session.metadata.lastActive = new Date().toISOString();
        
        // Format conversation history
        const messages = formatConversationHistory(session.history, prompt);
        
        console.log(`Request ${requestId}: Processing prompt for session ${sessionId}`);
        
        // Call OpenAI API with timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('OpenAI API timeout')), 30000);
        });
        
        const openaiPromise = openai.chat.completions.create({
            model: MODEL,
            messages: messages,
            max_tokens: MAX_TOKENS,
            temperature: TEMPERATURE,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
            stream: false
        });
        
        const completion = await Promise.race([openaiPromise, timeoutPromise]);
        
        // Extract response
        const response = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
        
        // Sanitize response
        const sanitizedResponse = sanitizeResponse(response);
        
        // Update session history
        session.history.push({
            role: 'user',
            content: prompt,
            timestamp: new Date().toISOString()
        });
        
        session.history.push({
            role: 'assistant',
            content: sanitizedResponse,
            timestamp: new Date().toISOString()
        });
        
        // Trim history if too long (keep last 50 messages)
        if (session.history.length > 50) {
            session.history = session.history.slice(-50);
        }
        
        // Calculate response time
        const responseTime = Date.now() - startTime;
        
        console.log(`Request ${requestId}: Completed in ${responseTime}ms`);
        
        // Return success response
        res.json({
            success: true,
            message: sanitizedResponse,
            sessionId: sessionId,
            metadata: {
                model: MODEL,
                tokens: completion.usage?.total_tokens || 0,
                responseTime: responseTime,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error(`Request ${requestId} error:`, error);
        
        // Handle specific OpenAI errors
        let statusCode = 500;
        let errorMessage = 'An unexpected error occurred. Please try again.';
        let errorCode = 'INTERNAL_ERROR';
        
        if (error.code === 'insufficient_quota') {
            statusCode = 429;
            errorMessage = 'AI service quota exceeded. Please try again later.';
            errorCode = 'QUOTA_EXCEEDED';
        } else if (error.code === 'rate_limit_exceeded') {
            statusCode = 429;
            errorMessage = 'Too many requests. Please wait a moment and try again.';
            errorCode = 'RATE_LIMIT_EXCEEDED';
        } else if (error.message === 'OpenAI API timeout') {
            statusCode = 504;
            errorMessage = 'AI service is taking too long to respond. Please try again.';
            errorCode = 'TIMEOUT';
        } else if (error.response?.status === 401) {
            statusCode = 503;
            errorMessage = 'AI service authentication failed. Please try again later.';
            errorCode = 'AUTH_ERROR';
        } else if (error.response?.status === 429) {
            statusCode = 429;
            errorMessage = 'Rate limit exceeded. Please try again later.';
            errorCode = 'RATE_LIMIT_EXCEEDED';
        } else if (error.response?.status === 400) {
            statusCode = 400;
            errorMessage = 'Invalid request to AI service.';
            errorCode = 'BAD_REQUEST';
        }
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            code: errorCode,
            requestId: requestId,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/session/:sessionId - Get session info
 */
app.get('/api/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(404).json({
            success: false,
            error: 'Session not found',
            code: 'SESSION_NOT_FOUND'
        });
    }
    
    const session = sessions.get(sessionId);
    
    res.json({
        success: true,
        session: {
            id: session.id,
            createdAt: session.createdAt,
            metadata: session.metadata,
            historyCount: session.history.length
        }
    });
});

/**
 * DELETE /api/session/:sessionId - Clear session history
 */
app.delete('/api/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(404).json({
            success: false,
            error: 'Session not found',
            code: 'SESSION_NOT_FOUND'
        });
    }
    
    const session = sessions.get(sessionId);
    session.history = [];
    session.metadata = {};
    
    res.json({
        success: true,
        message: 'Session history cleared',
        sessionId: sessionId
    });
});

/**
 * GET /api/stats - Get server statistics (admin only in production)
 */
app.get('/api/stats', (req, res) => {
    // In production, add authentication check here
    const stats = {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        sessions: {
            total: sessions.size,
            active: Array.from(sessions.values()).filter(s => {
                const lastActive = new Date(s.metadata.lastActive);
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                return lastActive > fiveMinutesAgo;
            }).length
        },
        config: {
            model: MODEL,
            maxTokens: MAX_TOKENS,
            temperature: TEMPERATURE
        }
    };
    
    res.json({
        success: true,
        stats
    });
});

/**
 * 404 handler for undefined routes
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'NOT_FOUND'
    });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    res.status(500).json({
        success: false,
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// Server Startup (for local development)
// ============================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Neopy AI Backend Server Started                     ║
║                                                          ║
║   Port: ${PORT}                                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   OpenAI Model: ${MODEL}                                   ║
║   OpenAI Status: ${isOpenAIConfigured() ? '✅ Configured' : '❌ Missing API Key'}     ║
║                                                          ║
║   Endpoints:                                             ║
║   - POST /api/ask        AI Chat                         ║
║   - GET  /api/health     Health Check                    ║
║   - GET  /api/stats      Statistics                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        `);
    });
}

// ============================================
// Export for Vercel Serverless Deployment
// ============================================
module.exports = app;
