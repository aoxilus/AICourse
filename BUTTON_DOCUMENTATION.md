# 🎮 GUI Buttons Documentation

## Overview
All buttons in the Python Learning Platform are functional and serve specific purposes. Here's a complete breakdown:

## Button Functions

### 1. **▶️ Run Code** ✅
- **Location**: Code Editor section
- **Function**: Executes Python code without validation
- **Purpose**: Allows students to test their code and see output before submitting
- **API**: `POST /execute` (without `submit: true`)
- **Rate Limit**: 200 executions per hour per user
- **Status**: ✅ Fully functional

### 2. **✅ Submit** ✅
- **Location**: Code Editor section
- **Function**: Validates code against expected output and marks level as complete
- **Purpose**: Official submission for level completion
- **API**: `POST /execute` (with `submit: true`)
- **Features**:
  - Validates output against expected result
  - Uses AI validation if enabled
  - Saves progress to session and localStorage
  - Unlocks next level on success
- **Rate Limit**: 200 executions per hour per user
- **Status**: ✅ Fully functional

### 3. **💡 Hint** ✅
- **Location**: Code Editor section
- **Function**: Provides helpful hints without revealing the solution
- **Purpose**: Guides students when stuck
- **API**: `POST /ai-hint`
- **Features**:
  - Uses AI-generated hints if API key is configured
  - Falls back to static hints if AI unavailable
  - Context-aware (considers current code)
- **Rate Limit**: 50 AI requests per hour per user
- **Status**: ✅ Fully functional

### 4. **🤖 New AI Question** ✅
- **Location**: Code Editor section
- **Function**: Generates a new question variation for the current level
- **Purpose**: Provides practice with different variations of the same concept
- **API**: `POST /ai-generate-question`
- **Features**:
  - Creates new task variations using AI
  - Maintains same learning objective
  - Updates UI with new question, expected output, and starter code
- **Rate Limit**: 50 AI requests per hour per user
- **Status**: ✅ Fully functional

### 5. **🤖 AI Review** ✅
- **Location**: Code Editor section (hidden by default)
- **Function**: Provides detailed AI-powered code analysis
- **Purpose**: Get comprehensive feedback on code quality and correctness
- **API**: `POST /ai-analyze`
- **Features**:
  - Only visible when AI is enabled (API key configured)
  - Analyzes code structure, correctness, and style
  - Provides improvement suggestions
- **Rate Limit**: 50 AI requests per hour per user
- **Status**: ✅ Fully functional (requires API key)

### 6. **← Back to Levels** ✅
- **Location**: Level interface header
- **Function**: Returns to level selection screen
- **Purpose**: Navigate back to choose different level
- **Status**: ✅ Fully functional

### 7. **Next Level** ✅
- **Location**: Success modal (after completing a level)
- **Function**: Advances to the next level
- **Purpose**: Continue learning progression
- **Status**: ✅ Fully functional

## Button Visibility

- **Always Visible**: Run Code, Submit, Hint, New AI Question, Back to Levels
- **Conditional**: AI Review (only shows when AI is enabled)
- **Modal Only**: Next Level (appears in success modal)

## API Key Usage

The API key is used functionally for:
1. **AI Code Analysis** - Reviews code quality and correctness
2. **AI Hints** - Generates context-aware hints
3. **AI Validation** - Validates submissions for AI-generated questions
4. **AI Question Generation** - Creates new question variations
5. **AI Debug Help** - Explains errors and suggests fixes

All AI features are rate-limited per user to control costs and prevent abuse.

## Session Management

- **Sessions**: Stored in cookies (httpOnly, secure in production)
- **User ID**: Automatically generated UUID per session
- **Progress**: Synced between server session and localStorage
- **Duration**: 24 hours (configurable via SESSION_MAX_AGE)

## Rate Limiting

- **Code Executions**: 200 per hour per user
- **AI Requests**: 50 per hour per user
- **Purpose**: Prevent abuse and control API costs
- **Storage**: In-memory (can be upgraded to Redis for production)



