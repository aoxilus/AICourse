# 🏗️ Platform Architecture

Complete technical architecture documentation for the Python Learning Platform.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Details](#component-details)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [AI Integration](#ai-integration)
7. [Database & Storage](#database--storage)
8. [API Endpoints](#api-endpoints)

---

## 🎯 System Overview

### Purpose
Interactive Python learning platform with 12 progressive levels, secure code execution, and optional AI-powered tutoring.

### Key Technologies
- **Frontend:** HTML5, Bootstrap 5, Vanilla JavaScript
- **Backend:** Node.js + Express
- **Code Execution:** Python 3.x (sandboxed subprocess)
- **AI:** OpenAI GPT-4o-mini (optional) - Code review, hints, debugging, question generation
- **Storage:** Browser LocalStorage

### Design Principles
1. **Security First:** Multiple layers of sandboxing and validation
2. **Progressive Enhancement:** Works without AI, better with it
3. **Stateless Backend:** No database required
4. **Client-Side State:** Progress tracked in browser
5. **Minimal Dependencies:** Lightweight and fast

---

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  index.html  │  │  script.js   │  │ LocalStorage │      │
│  │  (UI/View)   │◄─┤   (Logic)    │◄─┤  (Progress)  │      │
│  └──────────────┘  └──────┬───────┘  └──────────────┘      │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │ HTTPS/Fetch API
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVER SIDE                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Express.js Server                    │       │
│  │              (server.js)                          │       │
│  └────┬─────────────┬──────────────┬─────────────┬──┘       │
│       │             │              │             │           │
│       ▼             ▼              ▼             ▼           │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │/execute │  │/ai-hint  │  │/ai-analyze│ │/ai-status│    │
│  │endpoint │  │endpoint  │  │ endpoint │  │ endpoint │    │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │            │              │             │           │
│       ▼            └──────┬───────┘             │           │
│  ┌──────────────┐         │                     │           │
│  │SecurePython  │         ▼                     │           │
│  │Executor      │    ┌──────────────┐          │           │
│  └──────┬───────┘    │AICodeValidator│◄────────┘           │
│         │            └──────┬────────┘                      │
│         ▼                   │                               │
│  ┌──────────────┐          │                               │
│  │Python Sandbox│          │                               │
│  │(spawn/proc)  │          ▼                               │
│  └──────────────┘    ┌──────────────┐                      │
│                      │ OpenAI API   │                      │
│                      └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Details

### Frontend Components

#### **1. index.html**
- **Purpose:** UI structure and layout
- **Key Sections:**
  - Navigation bar with progress indicator
  - Level selection grid (12 cards)
  - Code editor interface
  - Terminal output display
  - Success modal

#### **2. script.js**
- **Purpose:** Application logic and state management
- **Main Class:** `PythonLearningPlatform`
- **Key Methods:**
  ```javascript
  initializeLevels()     // 12 level configurations
  selectLevel()          // Load level interface
  runCode()              // Execute code on server
  submitCode()           // Validate solution
  aiAnalyzeCode()        // Get AI review
  showHint()             // AI/static hints
  completeLevel()        // Award medal, unlock next
  updateProgress()       // Update UI progress
  ```

#### **3. LocalStorage Schema**
```javascript
{
  "completedLevels": [1, 2, 3, ...] // Array of completed level IDs
}
```

---

### Backend Components

#### **1. server.js (Node.js)**
- **Purpose:** Main application server
- **Port:** 3000 (default)
- **Dependencies:**
  - `express` - Web framework
  - `cors` - Cross-origin requests
  - `openai` - AI integration
  - `dotenv` - Configuration

**Key Classes:**
- `SecurePythonExecutor` - Handles code execution
- `AICodeValidator` - AI integration (imported)

#### **2. openai-validator.js**
- **Purpose:** AI features module
- **Main Class:** `AICodeValidator`
- **Key Methods:**
  ```javascript
  analyzeCode()          // Full code review
  getSmartHint()         // Context-aware hints
  validateAndExplain()   // Smart validation
  debugCode()            // Error explanations
  ```

#### **3. ai-question-generator.js**
- **Purpose:** AI-powered question generation
- **Main Class:** `AIQuestionGenerator`
- **Key Methods:**
  ```javascript
  generateQuestionVariation()  // Generate new question variations
  generateMultipleVariations() // Get multiple variations
  ```
- **Features:**
  - Dynamic question generation for each level
  - Maintains learning objectives while varying tasks
  - Creates fresh challenges for practice

---

## 🔄 Data Flow

### Code Execution Flow

```
1. User writes code in editor (script.js)
   ↓
2. Click "Run Code" button
   ↓
3. JavaScript sends POST to /execute
   ↓
4. Server validates code (isCodeSafe)
   ↓
5. Create temp file with code
   ↓
6. Spawn Python subprocess
   ↓
7. Collect output/errors (5s timeout)
   ↓
8. Delete temp file
   ↓
9. Return result to client
   ↓
10. Display in terminal output
```

### Submission Flow

```
1. User clicks "Submit" (script.js)
   ↓
2. POST to /execute with submit=true
   ↓
3. Execute code (same as above)
   ↓
4. Validate output vs. expected
   ↓
5. IF AI enabled:
   ├─ Send to OpenAI API
   ├─ Get validation feedback
   └─ Get improvement suggestions
   ↓
6. Return result + AI feedback
   ↓
7. IF passed:
   ├─ Show success modal
   ├─ Award medal
   ├─ Save to LocalStorage
   └─ Unlock next level
   ↓
8. IF failed:
   └─ Show error + AI debug help
```

### AI Review Flow

```
1. User clicks "AI Review" (script.js)
   ↓
2. POST to /ai-analyze
   ↓
3. Send code + context to OpenAI
   ↓
4. GPT-4o-mini analyzes code
   ↓
5. Return structured feedback
   ↓
6. Display in modal
```

---

## 🔒 Security Architecture

### Multi-Layer Security

#### **Layer 1: Frontend Validation**
- Input sanitization
- XSS prevention
- CORS enforcement

#### **Layer 2: Backend Code Analysis**
```javascript
Forbidden patterns:
- import os, sys, subprocess
- import socket, urllib, requests
- exec(), eval(), compile()
- __import__
- Infinite while True loops
```

#### **Layer 3: Execution Sandbox**
```
- Temporary file isolation
- Process timeout (5 seconds)
- Memory limits
- No network access
- No file system access (except temp)
- Automatic cleanup
```

#### **Layer 4: Resource Limits**
```javascript
MAX_EXECUTION_TIME: 5000ms
MAX_OUTPUT_LENGTH: 10000 chars
MAX_MEMORY: spawn limits (Node.js)
```

### Security Checklist
- ✅ No arbitrary code execution
- ✅ No system command injection
- ✅ No file system access
- ✅ No network requests
- ✅ No infinite loops
- ✅ No excessive memory use
- ✅ Automatic temp file cleanup
- ✅ Input validation
- ✅ Output size limits

---

## 🤖 AI Integration

### Architecture

```
┌──────────────────────────────────────────┐
│         AICodeValidator Class            │
├──────────────────────────────────────────┤
│                                          │
│  analyzeCode()                           │
│    ├─ Build prompt with code + context  │
│    ├─ Call OpenAI API                   │
│    └─ Return structured feedback        │
│                                          │
│  getSmartHint()                          │
│    ├─ Analyze current code              │
│    ├─ Generate contextual hint          │
│    └─ Return guidance                   │
│                                          │
│  validateAndExplain()                    │
│    ├─ Compare output vs. expected       │
│    ├─ Generate explanation              │
│    └─ Return validation + suggestions   │
│                                          │
│  debugCode()                             │
│    ├─ Analyze error message             │
│    ├─ Generate beginner-friendly fix    │
│    └─ Return explanation                │
│                                          │
└──────────────────────────────────────────┘
```

### AI Request/Response Format

**Request:**
```javascript
{
  code: "print('Hello')",
  level: 1,
  description: "Print Hello, Python World!",
  expectedOutput: "Hello, Python World!"
}
```

**Response:**
```javascript
{
  success: true,
  analysis: "Your code correctly uses print...",
  tokens_used: 234
}
```

### Cost Management
- Model: GPT-4o-mini (~$0.0005/request)
- Token limits: 500 max
- Temperature: 0.3-0.8 (balanced)
- Timeout: 30 seconds

---

## 💾 Database & Storage

### No Traditional Database
Platform is **stateless** with client-side storage.

### LocalStorage Structure
```javascript
// Key: "completedLevels"
// Value: JSON array
localStorage.setItem('completedLevels', '[1,2,3]')

// Read
const completed = JSON.parse(
  localStorage.getItem('completedLevels') || '[]'
)
```

### Benefits
- ✅ No database setup
- ✅ No user accounts needed
- ✅ Instant deployment
- ✅ Scales infinitely
- ✅ No data privacy concerns

### Limitations
- ❌ Progress not synced across devices
- ❌ Cleared when cache cleared
- ❌ No teacher dashboard

### Future Enhancements (Optional)
- Add MongoDB for progress tracking
- User authentication
- Teacher analytics dashboard
- Cross-device sync

---

## 🌐 API Endpoints

### Core Endpoints

#### **POST /execute**
Execute Python code with validation.

**Request:**
```json
{
  "code": "print('hello')",
  "level": 1,
  "submit": false
}
```

**Response:**
```json
{
  "success": true,
  "output": "hello",
  "error": "",
  "passed": false,
  "aiAnalysis": "...",
  "aiDebugHelp": "..."
}
```

---

#### **POST /ai-analyze**
Get AI code review.

**Request:**
```json
{
  "code": "print('hello')",
  "level": 1,
  "description": "Task description",
  "expectedOutput": "hello"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "Your code is correct...",
  "tokens_used": 234
}
```

---

#### **POST /ai-hint**
Get smart contextual hint.

**Request:**
```json
{
  "level": 1,
  "description": "Task description",
  "currentCode": "# student code"
}
```

**Response:**
```json
{
  "success": true,
  "hint": "Think about using the print() function..."
}
```

---

#### **POST /ai-generate-question**
Generate new AI-powered question variations.

**Request:**
```json
{
  "level": 1,
  "baseTask": "Print 'Hello, Python World!'",
  "concept": "basic print statements"
}
```

**Response:**
```json
{
  "success": true,
  "task": "Print 'Hello World 123'",
  "expectedOutput": "Hello World 123",
  "hint": "Use the print() function with the text in quotes",
  "starterCode": "# Write your code here\n"
}
```

---

#### **GET /ai-status**
Check if AI features are enabled.

**Response:**
```json
{
  "enabled": true,
  "message": "AI features are active"
}
```

---

#### **GET /**
Serve main HTML interface.

---

## 📊 Level Validation System

### Validation Types

**1. Exact Match**
```javascript
type: 'exact'
expected: "Hello, Python World!"
// Output must match exactly
```

**2. Contains**
```javascript
type: 'contains'
expected: "Cannot divide by zero"
// Output must contain the phrase
```

**3. Contains All**
```javascript
type: 'contains_all'
expected: ['Alice:', 'Bob:', 'Charlie:']
// Output must contain all phrases
```

**4. Conditional**
```javascript
type: 'conditional'
expected: ['bigger than 10', 'less than 10']
// Output must contain at least one
```

### Level Configuration Example

```javascript
{
  id: 1,
  title: "🥉 Print Master",
  emoji: "🖨️",
  description: "Learn basic printing",
  task: "Print 'Hello, Python World!'",
  expectedOutput: "Hello, Python World!",
  hint: "Use print() function",
  starterCode: "# Write code here\n",
  medal: "🥉"
}
```

---

## 🔧 Configuration

### Environment Variables (config.env)

```env
# Required for AI features
OPENAI_API_KEY=sk-...

# Optional configurations
PORT=3000
MAX_EXECUTION_TIME=5000
MAX_OUTPUT_LENGTH=10000
OPENAI_MODEL=gpt-4o-mini
MAX_TOKENS=500
TEMPERATURE=0.7
```

### Default Values
```javascript
PORT: 3000
MAX_EXECUTION_TIME: 5000ms
MAX_OUTPUT_LENGTH: 10000 chars
OPENAI_MODEL: "gpt-4o-mini"
MAX_TOKENS: 500
TEMPERATURE: 0.7
```

---

## 🚀 Deployment Architecture

### Development
```
npm install
npm start
→ http://localhost:3000
```

### Production Options

**Option 1: Node.js Server**
```bash
# Install dependencies
npm install --production

# Set environment
export NODE_ENV=production
export PORT=80

# Start with PM2
pm2 start server.js --name python-platform
```

**Option 2: Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Option 3: Cloud Platforms**
```bash
# Deploy to Heroku, Vercel, or similar
# Uses Node.js server
```

---

## 📈 Scalability

### Current Capacity
- **Concurrent Users:** 100-500
- **Requests/Second:** 50-100
- **Bottleneck:** Python subprocess spawning

### Scaling Strategies

**Horizontal Scaling:**
```
┌─────────┐
│ Load    │
│Balancer │
└────┬────┘
     │
     ├──► Server 1 (Node.js)
     ├──► Server 2 (Node.js)
     └──► Server 3 (Node.js)
```

**Optimization:**
1. Add Redis for rate limiting
2. Queue system for code execution
3. Pre-warmed Python processes
4. CDN for static assets

---

## 🧪 Testing Architecture

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for complete testing procedures.

### Test Layers
1. Unit Tests (individual functions)
2. Integration Tests (API endpoints)
3. Security Tests (forbidden operations)
4. E2E Tests (full user flow)
5. Load Tests (concurrent users)

---

## 📚 File Structure

```
python-learning-platform/
├── index.html              # Main UI
├── script.js               # Frontend logic
├── server.js               # Node.js server
├── openai-validator.js     # AI integration
├── ai-question-generator.js # AI question generation
├── package.json            # Dependencies
├── config.env              # Configuration
├── .gitignore             # Git exclusions
├── start.sh               # Unix startup
├── start.bat              # Windows startup
├── sample_solutions.py    # Test solutions
├── README.md              # Main docs
├── temp/                  # Execution temp files
└── docs/                  # Documentation
    ├── ARCHITECTURE.md    # This file
    ├── AI_QUICKSTART.md   # AI setup
    ├── OPENAI_SETUP.md    # Detailed AI guide
    ├── TESTING_GUIDE.md   # Test procedures
    └── WHATS_NEW_AI.md    # Feature overview
```

---

## 🔮 Future Enhancements

### Planned Features
1. **User Authentication**
   - Teacher accounts
   - Student progress tracking
   - Class management

2. **Analytics Dashboard**
   - Completion rates
   - Common mistakes
   - Time tracking

3. **More Languages**
   - JavaScript levels
   - Java levels
   - C++ levels

4. **Advanced Levels**
   - Level 13-20 (advanced topics)
   - Project-based learning
   - Certification system

5. **Collaborative Features**
   - Code sharing
   - Peer review
   - Discussion forums

---

## 💡 Design Decisions

### Why No Database?
- Simplicity and quick deployment
- No data privacy concerns
- Infinite scalability
- Works offline after first load

### Why LocalStorage?
- Instant saving
- No server calls
- Works offline
- Simple implementation

### Why Node.js?
- Modern JavaScript ecosystem
- Better performance
- Full AI feature support
- Easy deployment options

### Why Optional AI?
- Cost consideration
- Works without API key
- Progressive enhancement
- Not everyone has OpenAI access

---

## 🛠️ Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review OpenAI costs
- [ ] Monitor error logs
- [ ] Check Python compatibility
- [ ] Update course content
- [ ] Review security advisories

### Monitoring
- Server uptime
- API response times
- Error rates
- AI costs
- User completion rates

---

## 📞 Support & Contact

For technical questions:
- Review documentation in `/docs`
- Check troubleshooting guides
- Test with sample solutions

---

**Architecture Version:** 1.0
**Last Updated:** December 2025
**Maintained By:** Python Learning Platform Team
