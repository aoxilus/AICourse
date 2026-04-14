# 📝 Changelog

## Recent Changes

### Removed PHP Support
- **Removed:** `execute.php`, `index.php`, `router.php`, `start-php-server.ps1`
- **Reason:** Project now uses Node.js + Python only for simpler architecture
- **Note:** PHP can remain installed on your system for other projects

### Added AI Question Generation
- **New Feature:** Dynamic AI-powered question variations
- **File:** `ai-question-generator.js`
- **Endpoint:** `POST /ai-generate-question`
- **Functionality:**
  - Generates new question variations for each level
  - Maintains learning objectives while varying tasks
  - Creates fresh challenges for practice
  - Examples: "Print 'Hello World 123'" instead of "Print 'Hello, Python World!'"

### Fixed Windows Path Handling
- **Issue:** Paths with spaces (like OneDrive) caused execution failures
- **Fix:** Properly quoted command strings in `server.js` for Windows
- **Result:** System now works in any directory, including spaces in path

### Updated Architecture
- **Stack:** Node.js + Python only
- **AI Features:** Full OpenAI integration (code review, hints, debugging, question generation)
- **Status:** All tests passing, system functional

---

**Test URL:** `http://localhost:3000`



