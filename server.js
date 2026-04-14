const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

// Load environment variables - try .env first, then config.env
if (fs.existsSync('.env')) {
    require('dotenv').config({ path: '.env' });
} else {
    require('dotenv').config({ path: './config.env' });
}

const AICodeValidator = require('./openai-validator');
const AIQuestionGenerator = require('./ai-question-generator');

const app = express();
const PORT = process.env.PORT || 3000;
const aiValidator = new AICodeValidator();
const aiQuestionGen = new AIQuestionGenerator();

// Session storage (in-memory, can be upgraded to Redis/MongoDB for production)
const sessionStore = new Map();

// Rate limiting storage (per user)
const rateLimits = new Map();
const progressFile = path.join(__dirname, 'temp', 'user-progress.json');
const MAIN_USER_EMAIL = (process.env.MAIN_USER_EMAIL || 'aoxilus@gmail.com').toLowerCase();
const MAIN_USER_NAME = process.env.MAIN_USER_NAME || 'aoxilus';

function ensureProgressStore() {
    const progressDir = path.dirname(progressFile);
    if (!fs.existsSync(progressDir)) {
        fs.mkdirSync(progressDir, { recursive: true });
    }
    if (!fs.existsSync(progressFile)) {
        fs.writeFileSync(progressFile, JSON.stringify({ users: {} }, null, 2), 'utf8');
    }
}

function loadProgressStore() {
    try {
        ensureProgressStore();
        const raw = fs.readFileSync(progressFile, 'utf8');
        const parsed = JSON.parse(raw || '{}');
        if (!parsed.users || typeof parsed.users !== 'object') {
            return { users: {} };
        }
        return parsed;
    } catch (error) {
        console.error('Failed to load persistent progress store:', error.message);
        return { users: {} };
    }
}

function saveProgressStore(store) {
    ensureProgressStore();
    fs.writeFileSync(progressFile, JSON.stringify(store, null, 2), 'utf8');
}

function getUserRecord(userEmail) {
    const store = loadProgressStore();
    const key = (userEmail || '').toLowerCase();
    return store.users[key] || null;
}

function getSavedProgressForUser(userEmail) {
    const userData = getUserRecord(userEmail);
    if (!userData || !Array.isArray(userData.completedLevels)) {
        return [];
    }
    return userData.completedLevels.filter(level => Number.isInteger(level) && level >= 1 && level <= 12);
}

function getSavedDraftsForUser(userEmail) {
    const userData = getUserRecord(userEmail);
    if (!userData || !userData.draftByLevel || typeof userData.draftByLevel !== 'object') {
        return {};
    }
    return userData.draftByLevel;
}

function getSavedCurrentLevelForUser(userEmail) {
    const userData = getUserRecord(userEmail);
    if (!userData || !Number.isInteger(userData.currentLevel)) {
        return 1;
    }
    return userData.currentLevel;
}

function saveUserState(userEmail, partialState = {}) {
    const key = (userEmail || '').toLowerCase();
    const store = loadProgressStore();
    const existing = store.users[key] || {};
    const cleanLevels = Array.isArray(partialState.completedLevels)
        ? [...new Set(partialState.completedLevels.filter(level => Number.isInteger(level) && level >= 1 && level <= 12))].sort((a, b) => a - b)
        : (Array.isArray(existing.completedLevels) ? existing.completedLevels : []);
    const cleanDrafts = partialState.draftByLevel && typeof partialState.draftByLevel === 'object'
        ? partialState.draftByLevel
        : (existing.draftByLevel && typeof existing.draftByLevel === 'object' ? existing.draftByLevel : {});
    const cleanCurrentLevel = Number.isInteger(partialState.currentLevel)
        ? partialState.currentLevel
        : (Number.isInteger(existing.currentLevel) ? existing.currentLevel : 1);

    store.users[key] = {
        email: key,
        name: MAIN_USER_NAME,
        completedLevels: cleanLevels,
        draftByLevel: cleanDrafts,
        currentLevel: cleanCurrentLevel,
        updatedAt: Date.now()
    };
    saveProgressStore(store);
}

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'python-learning-platform-secret-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000 // 24 hours
    }
}));

// User identification middleware
app.use((req, res, next) => {
    const profileEmail = MAIN_USER_EMAIL;
    req.session.profileEmail = profileEmail;
    req.session.profileName = MAIN_USER_NAME;
    if (!req.session.userId) {
        req.session.userId = uuidv4();
        req.session.createdAt = Date.now();
        req.session.completedLevels = getSavedProgressForUser(profileEmail);
        req.session.currentLevel = getSavedCurrentLevelForUser(profileEmail);
        req.session.draftByLevel = getSavedDraftsForUser(profileEmail);
        req.session.codeExecutions = 0;
        req.session.aiRequests = 0;
    } else if (!Array.isArray(req.session.completedLevels) || req.session.completedLevels.length === 0) {
        req.session.completedLevels = getSavedProgressForUser(profileEmail);
        req.session.currentLevel = getSavedCurrentLevelForUser(profileEmail);
        req.session.draftByLevel = getSavedDraftsForUser(profileEmail);
    }
    next();
});

// Rate limiting middleware
const checkRateLimit = (type, maxRequests) => {
    return (req, res, next) => {
        const userId = req.session.userId;
        const now = Date.now();
        const hourAgo = now - 3600000; // 1 hour
        
        if (!rateLimits.has(userId)) {
            rateLimits.set(userId, { [type]: [] });
        }
        
        const userLimits = rateLimits.get(userId);
        if (!userLimits[type]) {
            userLimits[type] = [];
        }
        
        // Clean old entries
        userLimits[type] = userLimits[type].filter(timestamp => timestamp > hourAgo);
        
        if (userLimits[type].length >= maxRequests) {
            return res.json({
                success: false,
                error: `Rate limit exceeded. Maximum ${maxRequests} ${type} requests per hour. Please try again later.`
            });
        }
        
        userLimits[type].push(now);
        next();
    };
};

// Clean up old rate limit entries periodically
setInterval(() => {
    const now = Date.now();
    const hourAgo = now - 3600000;
    for (const [userId, limits] of rateLimits.entries()) {
        for (const type in limits) {
            limits[type] = limits[type].filter(timestamp => timestamp > hourAgo);
        }
        // Remove user if no active limits
        if (Object.values(limits).every(arr => arr.length === 0)) {
            rateLimits.delete(userId);
        }
    }
}, 3600000); // Clean every hour

app.use(express.json());
app.use(express.static('.'));

// Security settings
const MAX_EXECUTION_TIME = parseInt(process.env.MAX_EXECUTION_TIME_MS, 10) || 15000; // 15 seconds default
const EXECUTION_TIMEOUT_SECONDS = Math.floor(MAX_EXECUTION_TIME / 1000);
const MAX_OUTPUT_LENGTH = 10000; // 10KB

class SecurePythonExecutor {
    constructor() {
        this.tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
        
        this.levels = {
            1: { expected: 'Hello, Python World!', type: 'exact' },
            2: { expected: ['bigger than 10', 'less than 10', 'hey this is not a number'], type: 'conditional' },
            3: { expected: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10', type: 'exact' },
            4: { expected: ['1. ', '2. ', '3. ', '4. ', '5. '], type: 'contains_all' },
            5: { expected: 'The area is: 15', type: 'exact' },
            6: { expected: ['Alice:', 'Bob:', 'Charlie:'], type: 'contains_all' },
            7: { expected: ['File created successfully!', 'File contents: Python is awesome!'], type: 'contains_all' },
            8: { expected: 'Cannot divide by zero', type: 'contains' },
            9: { expected: ['Car created:', 'engine started'], type: 'contains_all' },
            10: { expected: ['Sum: 326', 'Average:', 'Max: 89', 'Min: 12'], type: 'contains_all' },
            11: { expected: 'Today is:', type: 'contains' },
            12: { expected: ['Contact', 'added', 'Contacts:'], type: 'contains_all' }
        };
    }
    
    isCodeSafe(code) {
        // Forbidden operations - expanded list
        const forbidden = [
            'import os',
            'import sys',
            'import subprocess',
            'import socket',
            'import urllib',
            'import requests',
            'import http',
            'import ctypes',
            'import pickle',
            'import marshal',
            'import multiprocessing',
            'import threading',
            'from os import',
            'from sys import',
            'from subprocess import',
            'exec(',
            'eval(',
            'compile(',
            '__import__',
            '__builtins__',
            'vars(__builtins__)',
            'getattr(__builtins__',
            'globals()',
            'locals()',
            'dir(__builtins__)',
            'open('
        ];
        
        // Block path traversal and absolute path attempts
        if (code.includes('../') || code.includes('..\\') || code.match(/[a-zA-Z]:\\/) || code.startsWith('/')) {
            return false;
        }
        
        // Block common bypass attempts
        const bypassPatterns = [
            /['"](.*)['"]\s*\.join\s*\(/g,  // String joining to hide keywords
            /getattr\s*\(/gi,
            /__getattribute__/gi,
            /setattr\s*\(/gi,
            /delattr\s*\(/gi,
            /hasattr\s*\(/gi
        ];
        
        for (const pattern of forbidden) {
            // Allow open ONLY if it strictly refers to 'message.txt' (Level 7)
            if (pattern === 'open(' && code.includes('open(') && (code.includes("'message.txt'") || code.includes('"message.txt"'))) {
                // Check if they are trying to open anything else
                const openCount = (code.match(/open\(/g) || []).length;
                const messageCount = (code.match(/['"]message\.txt['"]/g) || []).length;
                if (openCount === messageCount) {
                    continue; // Allowed!
                }
            }
            if (code.includes(pattern)) {
                return false;
            }
        }
        
        // Check for bypass patterns
        for (const pattern of bypassPatterns) {
            if (pattern.test(code)) {
                // Allow if it's clearly safe (like checking attributes on user objects)
                // But block if combined with dangerous keywords
                if (/exec|eval|import|__import__/i.test(code)) {
                    return false;
                }
            }
        }
        
        // Check for infinite loops (basic detection)
        if (/(while\s+True|while\s+1|while\s+["'].*["'])\s*:/.test(code) && !/break/.test(code)) {
            return false;
        }
        
        // Block suspiciously long code (potential DoS)
        if (code.length > 50000) {
            return false;
        }
        
        return true;
    }
    
    async executeCode(code, level, isSubmission = false, userInput = null) {
        if (!this.isCodeSafe(code)) {
            return { success: false, error: 'Code contains forbidden operations' };
        }
        
        const filename = path.join(this.tempDir, `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`);
        
        try {
            fs.writeFileSync(filename, code);
            
            const result = await this.runPythonCode(filename, level, userInput);
            
            if (isSubmission) {
                const passed = this.validateOutput(result.output, level);
                return {
                    success: result.success,
                    output: result.output,
                    error: result.error,
                    passed: passed
                };
            }
            
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            // Clean up
            if (fs.existsSync(filename)) {
                fs.unlinkSync(filename);
            }
        }
    }
    
    runPythonCode(filename, level, userInput = null) {
        return new Promise((resolve) => {
            let input = '';
            
            // Use user-provided input if available, otherwise use default for specific levels
            if (userInput !== null && userInput !== undefined) {
                // Ensure input ends with newline if it doesn't already
                input = userInput.toString();
                if (!input.endsWith('\n')) {
                    input += '\n';
                }
            } else {
                // Prepare input for specific levels (for submissions/validation)
                if (level === 2) {
                    input = '15\n'; // Test with number > 10
                } else if (level === 8) {
                    input = '10\n0\n'; // Test division by zero
                }
            }
            
            // Use local portable Python on Windows (python.cmd), system python3 elsewhere
            let python;
            
            if (process.platform === 'win32') {
                const pythonPath = path.join(__dirname, 'python.cmd');
                // Quote paths to handle spaces in Windows paths - use shell with quoted command
                const cmd = `"${pythonPath}" "${filename}"`;
                python = spawn(cmd, [], { shell: true });
            } else {
                python = spawn('python3', [filename], {});
            }
            let output = '';
            let error = '';
            
            // Set timeout
            const timeout = setTimeout(() => {
                python.kill('SIGKILL');
                resolve({ success: false, output: '', error: `Execution timeout (${EXECUTION_TIMEOUT_SECONDS} seconds)` });
            }, MAX_EXECUTION_TIME);
            
            // Handle input
            if (input) {
                python.stdin.write(input);
                python.stdin.end();
            }
            
            // Collect output
            python.stdout.on('data', (data) => {
                output += data.toString();
                if (output.length > MAX_OUTPUT_LENGTH) {
                    python.kill('SIGKILL');
                    clearTimeout(timeout);
                    resolve({ success: false, output: '', error: 'Output too long' });
                }
            });
            
            python.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            python.on('close', (code) => {
                clearTimeout(timeout);
                
                if (code === 0) {
                    resolve({ success: true, output: output.trim(), error: '' });
                } else {
                    let rawError = error.trim();
                    let friendlyError = rawError;
                    
                    // Simplify and explain common beginner Python errors
                    if (rawError.includes('EOFError: EOF when reading a line')) {
                        friendlyError = "🚨 Error: You are trying to read more inputs than provided!\n\n💡 Fix: Make sure your code only has ONE input() command for this level. Every input() tries to wait for a user to type, but the platform only sent one answer.";
                    } else if (rawError.includes('IndentationError:') || rawError.includes('TabError:')) {
                        friendlyError = "🚨 Error: Indentation Error (Spacing)\n\n💡 Fix: Python is very strict about spaces! Make sure your blocks (like inside an if or try) line up perfectly. Don't mix spaces and tabs.";
                    } else if (rawError.includes('SyntaxError:')) {
                        // Extract line number if possible
                        const match = rawError.match(/line (\d+)/);
                        const lineStr = match ? ` around line ${match[1]}` : '';
                        friendlyError = `🚨 Error: Syntax Error${lineStr}\n\n💡 Fix: There's a typo in your code. Check for missing colons (:), unclosed parentheses (), or misspelled keywords.`;
                    } else if (rawError.includes('NameError:')) {
                        friendlyError = `🚨 Error: Variable name not found\n\n💡 Fix: You used a variable that hasn't been created yet, or it's misspelled. Make sure you define variables before using them.\n\nRaw detail: ${rawError.split('\\n').pop()}`;
                    } else if (rawError.includes('ValueError:') && rawError.includes('invalid literal for int()')) {
                        friendlyError = `🚨 Error: Value Error (Conversion)\n\n💡 Fix: You tried to convert a word or letter into a number using int() or float(), but it wasn't a valid number!`;
                    }
                    
                    resolve({ success: false, output: '', error: friendlyError });
                }
            });
            
            python.on('error', (err) => {
                clearTimeout(timeout);
                resolve({ success: false, output: '', error: `Failed to start Python: ${err.message}` });
            });
        });
    }
    
    validateOutput(output, level) {
        const levelConfig = this.levels[level];
        if (!levelConfig) return false;
        
        const { expected, type } = levelConfig;
        const normalizedOutput = output.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const normalizedExpected = typeof expected === 'string'
            ? expected.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
            : expected;
        const outputLower = normalizedOutput.toLowerCase();
        
        switch (type) {
            case 'exact':
                return normalizedOutput.trim() === normalizedExpected.trim();
                
            case 'contains':
                return outputLower.includes(normalizedExpected.toLowerCase());
                
            case 'contains_all':
                return expected.every(item => 
                    outputLower.includes(item.toLowerCase())
                );
                
            case 'conditional':
                return expected.some(item => 
                    outputLower.includes(item.toLowerCase())
                );
                
            default:
                return false;
        }
    }
}

const executor = new SecurePythonExecutor();

// Test runner helper for dashboard
const TEST_SUITES = [
    { id: 'security', file: 'security.test.js', label: 'Security tests' },
    { id: 'api', file: 'api.test.js', label: 'API/structure tests' },
    { id: 'levels', file: 'levels.test.js', label: 'Level solution tests' },
    { id: 'ai', file: 'ai-features.test.js', label: 'AI helper tests' }
];

function runTestSuite(testFile) {
    return new Promise((resolve) => {
        const nodeExecutable = process.execPath || 'node';
        const testPath = path.join(__dirname, 'tests', testFile);

        let output = '';
        let errorOutput = '';

        const child = spawn(nodeExecutable, [testPath], {
            cwd: __dirname
        });

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        child.on('close', (code) => {
            resolve({
                exitCode: code,
                passed: code === 0,
                output,
                error: errorOutput
            });
        });

        child.on('error', (err) => {
            resolve({
                exitCode: null,
                passed: false,
                output,
                error: err.message
            });
        });
    });
}

// Routes
app.post('/execute', checkRateLimit('codeExecutions', parseInt(process.env.MAX_CODE_EXECUTIONS_PER_HOUR) || 200), async (req, res) => {
    const { code, level, submit, aiExpectedOutput, aiTask, userInput } = req.body;
    
    if (!code || !level) {
        return res.json({ success: false, error: 'Missing required parameters' });
    }
    
    try {
        const result = await executor.executeCode(code, level, submit, userInput);
        
        // Track completion in session
        if (submit && result.passed && !req.session.completedLevels.includes(level)) {
            req.session.completedLevels.push(level);
            req.session.completedLevels.sort((a, b) => a - b);
            saveUserState(req.session.profileEmail, {
                completedLevels: req.session.completedLevels,
                draftByLevel: req.session.draftByLevel,
                currentLevel: req.session.currentLevel
            });
        }
        
        // For AI-generated questions, always use AI validation
        if (submit && aiExpectedOutput && aiValidator.enabled && result.success) {
            // Check rate limit
            const userId = req.session.userId;
            const now = Date.now();
            const hourAgo = now - 3600000;
            
            if (!rateLimits.has(userId)) {
                rateLimits.set(userId, { aiRequests: [] });
            }
            const userLimits = rateLimits.get(userId);
            if (!userLimits.aiRequests) {
                userLimits.aiRequests = [];
            }
            userLimits.aiRequests = userLimits.aiRequests.filter(timestamp => timestamp > hourAgo);
            
            if (userLimits.aiRequests.length < (parseInt(process.env.MAX_AI_REQUESTS_PER_HOUR) || 50)) {
                userLimits.aiRequests.push(now);
                
                const aiValidation = await aiValidator.validateAndExplain(
                    code,
                    level,
                    aiTask || `Level ${level}`,
                    aiExpectedOutput,
                    result.output
                );
                
                if (aiValidation.success) {
                    result.aiAnalysis = aiValidation.explanation;
                    result.aiSuggestions = aiValidation.suggestions;
                    // Use AI's passed status for AI-generated questions
                    if (aiValidation.passed !== undefined) {
                        result.aiPassed = aiValidation.passed;
                        result.passed = aiValidation.passed; // Override standard validation
                    }
                }
            }
        }
        // If submission and AI is enabled, get AI validation (for standard questions)
        else if (submit && aiValidator.enabled && result.success) {
            // Check rate limit for AI validation
            const userId = req.session.userId;
            const now = Date.now();
            const hourAgo = now - 3600000;
            
            if (!rateLimits.has(userId)) {
                rateLimits.set(userId, { aiRequests: [] });
            }
            const userLimits = rateLimits.get(userId);
            if (!userLimits.aiRequests) {
                userLimits.aiRequests = [];
            }
            userLimits.aiRequests = userLimits.aiRequests.filter(timestamp => timestamp > hourAgo);
            
            if (userLimits.aiRequests.length < (parseInt(process.env.MAX_AI_REQUESTS_PER_HOUR) || 50)) {
                userLimits.aiRequests.push(now);
                
                const levelConfig = executor.levels[level];
                const aiValidation = await aiValidator.validateAndExplain(
                    code,
                    level,
                    `Level ${level}`,
                    typeof levelConfig.expected === 'string' ? levelConfig.expected : levelConfig.expected.join(', '),
                    result.output
                );
                
                if (aiValidation.success) {
                    result.aiAnalysis = aiValidation.explanation;
                    result.aiSuggestions = aiValidation.suggestions;
                    // For standard levels, keep deterministic validator as source of truth.
                    // AI feedback is advisory here to avoid false negatives.
                    if (aiValidation.passed !== undefined) {
                        result.aiPassed = aiValidation.passed;
                    }
                }
            }
        }
        
        // If there's an error and AI is enabled, get debugging help
        if (!result.success && result.error && aiValidator.enabled) {
            const userId = req.session.userId;
            const now = Date.now();
            const hourAgo = now - 3600000;
            
            if (!rateLimits.has(userId)) {
                rateLimits.set(userId, { aiRequests: [] });
            }
            const userLimits = rateLimits.get(userId);
            if (!userLimits.aiRequests) {
                userLimits.aiRequests = [];
            }
            userLimits.aiRequests = userLimits.aiRequests.filter(timestamp => timestamp > hourAgo);
            
            if (userLimits.aiRequests.length < (parseInt(process.env.MAX_AI_REQUESTS_PER_HOUR) || 50)) {
                userLimits.aiRequests.push(now);
                
                const debugHelp = await aiValidator.debugCode(code, result.error, level);
                if (debugHelp.success) {
                    result.aiDebugHelp = debugHelp.explanation;
                }
            }
        }
        
        res.json(result);
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// AI Code Analysis endpoint
app.post('/ai-analyze', checkRateLimit('aiRequests', parseInt(process.env.MAX_AI_REQUESTS_PER_HOUR) || 50), async (req, res) => {
    const { code, level, description, expectedOutput } = req.body;
    
    if (!code || !level) {
        return res.json({ success: false, error: 'Missing required parameters' });
    }
    
    try {
        const analysis = await aiValidator.analyzeCode(code, level, description, expectedOutput);
        res.json(analysis);
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// AI Smart Hint endpoint
app.post('/ai-hint', checkRateLimit('aiRequests', parseInt(process.env.MAX_AI_REQUESTS_PER_HOUR) || 50), async (req, res) => {
    const { level, description, currentCode } = req.body;
    
    if (!level) {
        return res.json({ success: false, error: 'Missing required parameters' });
    }
    
    try {
        const hint = await aiValidator.getSmartHint(level, description, currentCode);
        res.json(hint);
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Check AI status
app.get('/ai-status', (req, res) => {
    res.json({ 
        enabled: aiValidator.enabled,
        message: aiValidator.enabled ? 'AI features are active' : 'OpenAI API key not configured'
    });
});

// AI Question Generation endpoint
app.post('/ai-generate-question', checkRateLimit('aiRequests', parseInt(process.env.MAX_AI_REQUESTS_PER_HOUR) || 50), async (req, res) => {
    const { level, baseTask, concept } = req.body;
    
    if (!level) {
        return res.json({ success: false, error: 'Level is required' });
    }
    
    try {
        const variation = await aiQuestionGen.generateQuestionVariation(
            level,
            baseTask || '',
            concept || ''
        );
        
        if (variation) {
            res.json({ success: true, ...variation });
        } else {
            res.json({ 
                success: false, 
                error: 'AI question generation unavailable. Using default question.' 
            });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// AI Chat Copilot endpoint
app.post('/ai-chat', checkRateLimit('aiRequests', parseInt(process.env.MAX_AI_REQUESTS_PER_HOUR) || 50), async (req, res) => {
    const { message, code, level, context } = req.body;
    
    if (!message) {
        return res.json({ success: false, error: 'Message is required' });
    }
    
    if (!aiValidator.enabled) {
        return res.json({ 
            success: false, 
            error: 'AI features are not enabled. Please configure OpenAI API key in config.env' 
        });
    }
    
    try {
        const levelConfig = executor.levels[level] || {};
        const expectedOutput = Array.isArray(levelConfig.expected) 
            ? levelConfig.expected.join(', ') 
            : (levelConfig.expected || '');
        
        const result = await aiValidator.chatTutor(
            message,
            code,
            level,
            context,
            expectedOutput
        );

        if (result.success) {
            return res.json({
                success: true,
                response: result.response
            });
        }

        return res.json({
            success: false,
            error: result.message || 'Failed to get AI response'
        });
    } catch (error) {
        res.json({ 
            success: false, 
            error: error.message || 'Failed to get AI response' 
        });
    }
});

// Test dashboard API - run all Node test suites and report status
app.get('/api/tests/run', async (req, res) => {
    try {
        const results = [];

        for (const suite of TEST_SUITES) {
            const suiteResult = await runTestSuite(suite.file);
            results.push({
                id: suite.id,
                file: suite.file,
                label: suite.label,
                passed: suiteResult.passed,
                exitCode: suiteResult.exitCode,
                output: suiteResult.output,
                error: suiteResult.error
            });
        }

        const passed = results.filter(r => r.passed).length;
        const failed = results.length - passed;

        res.json({
            success: true,
            suites: results,
            summary: {
                passed,
                failed,
                total: results.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to run tests'
        });
    }
});

// Get user session data (progress)
app.get('/api/session', (req, res) => {
    res.json({
        userId: req.session.userId,
        profileName: req.session.profileName,
        profileEmail: req.session.profileEmail,
        currentLevel: req.session.currentLevel || 1,
        draftByLevel: req.session.draftByLevel || {},
        completedLevels: req.session.completedLevels || [],
        createdAt: req.session.createdAt
    });
});

// Update user progress (sync from client)
app.post('/api/session/progress', (req, res) => {
    const { completedLevels } = req.body;
    if (Array.isArray(completedLevels)) {
        req.session.completedLevels = [...new Set(completedLevels.filter(level => Number.isInteger(level) && level >= 1 && level <= 12))].sort((a, b) => a - b);
        saveUserState(req.session.profileEmail, {
            completedLevels: req.session.completedLevels,
            draftByLevel: req.session.draftByLevel,
            currentLevel: req.session.currentLevel
        });
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'Invalid progress data' });
    }
});

app.post('/api/session/reset', (req, res) => {
    req.session.completedLevels = [];
    req.session.currentLevel = 1;
    req.session.draftByLevel = {};
    saveUserState(req.session.profileEmail, {
        completedLevels: [],
        currentLevel: 1,
        draftByLevel: {}
    });
    res.json({ success: true, completedLevels: [] });
});

app.post('/api/session/draft', (req, res) => {
    const { levelId, code } = req.body;
    const parsedLevel = parseInt(levelId, 10);

    if (!Number.isInteger(parsedLevel) || parsedLevel < 1 || parsedLevel > 12 || typeof code !== 'string') {
        return res.json({ success: false, error: 'Invalid draft data' });
    }

    req.session.currentLevel = parsedLevel;
    req.session.draftByLevel = req.session.draftByLevel || {};
    req.session.draftByLevel[parsedLevel] = code;
    saveUserState(req.session.profileEmail, {
        completedLevels: req.session.completedLevels,
        draftByLevel: req.session.draftByLevel,
        currentLevel: req.session.currentLevel
    });

    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler for API routes - return JSON
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/execute') || 
        req.path.startsWith('/ai-') || req.method === 'POST') {
        return res.status(404).json({ 
            success: false, 
            error: `Route ${req.method} ${req.path} not found` 
        });
    }
    next();
});

// Error handler - always return JSON for errors
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    if (req.path.startsWith('/api') || req.path.startsWith('/execute') || 
        req.path.startsWith('/ai-') || req.method === 'POST') {
        return res.status(500).json({ 
            success: false, 
            error: err.message || 'Internal server error' 
        });
    }
    res.status(500).send('Internal server error');
});

// Start server
app.listen(PORT, () => {
    console.log(`🐍 Python Learning Platform running on http://localhost:${PORT}`);
    console.log('🚀 Ready to teach Python!');
    console.log(`📊 Session management: Enabled (cookie-based)`);
    console.log(`🔒 Rate limiting: ${process.env.MAX_AI_REQUESTS_PER_HOUR || 50} AI requests/hour, ${process.env.MAX_CODE_EXECUTIONS_PER_HOUR || 200} code executions/hour`);
    if (aiValidator.enabled) {
        console.log('🤖 AI features: Enabled');
    } else {
        console.log('⚠️  AI features: Disabled (API key not configured)');
    }
});

module.exports = app;
