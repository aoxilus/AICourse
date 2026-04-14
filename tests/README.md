# 🧪 Test Suite Documentation

Automated tests for the Python Learning Platform.

## 📦 Test Structure

```
tests/
├── test-runner.js      # Simple test framework (no dependencies)
├── security.test.js    # Security validation tests
├── api.test.js         # API and file structure tests
├── levels.test.js      # Level solution tests
├── ai-features.test.js # AI helper/validator tests (no external API calls)
├── run-all-tests.js    # Master test runner
└── README.md           # This file
```

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Individual Test Suites
```bash
# Security tests only
npm run test:security

# API/structure tests only
npm run test:api

# Level solution tests only
npm run test:levels

# AI helper/validator tests only
npm run test:ai
```

### Direct Execution
```bash
# Run all tests
node tests/run-all-tests.js

# Run specific test file
node tests/security.test.js
node tests/api.test.js
node tests/levels.test.js
```

## 📋 Test Categories

### 1. Security Tests (`security.test.js`)
Tests that validate security measures:

- ✅ Blocks dangerous imports (os, sys, subprocess, socket)
- ✅ Blocks eval() and exec() functions
- ✅ Blocks infinite while loops
- ✅ Allows safe code patterns
- ✅ Allows loops with breaks

**Tests:** 10 security validation tests

---

### 2. API Tests (`api.test.js`)
Tests that validate project structure and files:

- ✅ Server files exist (server.js, openai-validator.js)
- ✅ Frontend files exist (index.html, script.js)
- ✅ Configuration files exist (package.json, config.env)
- ✅ Documentation structure is complete
- ✅ Required dependencies are listed
- ✅ Sample solutions exist
- ✅ Startup scripts exist

**Tests:** 9 structure validation tests

---

### 3. Level Tests (`levels.test.js`)
Tests that validate level solutions work correctly:

- ✅ Level 1: Basic printing
- ✅ Level 2: Input validation (number > 10)
- ✅ Level 2: Input validation (non-number)
- ✅ Level 3: For loops (1-10)
- ✅ Level 4: Lists with enumeration
- ✅ Level 5: Function definitions
- ✅ Level 6: Dictionary iteration
- ✅ Level 9: Class creation (OOP)
- ✅ Level 10: Data analysis
- ✅ Level 11: Module imports

**Tests:** 10 level solution tests

---

### 4. AI Helper Tests (`ai-features.test.js`)
Tests that validate AI integration helpers without calling the real OpenAI API:

- ✅ `AICodeValidator` constructor disables on placeholder API keys
- ✅ `AICodeValidator.analyzeCode` returns clear message when disabled
- ✅ `AICodeValidator.getSmartHint` returns clear message when disabled
- ✅ `AICodeValidator.validateAndExplain` returns clear message when disabled
- ✅ `AICodeValidator.debugCode` returns clear message when disabled
- ✅ `AIQuestionGenerator` constructor disables when API key is missing
- ✅ `AIQuestionGenerator.generateQuestionVariation` behavior when disabled
- ✅ `AIQuestionGenerator.generateMultipleVariations` behavior when disabled

**Tests:** 8 AI helper validation tests

## 📊 Test Output

### Successful Test Run
```
╔════════════════════════════════════════════════════════════╗
║       🐍 Python Learning Platform Test Suite              ║
╚════════════════════════════════════════════════════════════╝

🔍 Running security.test.js...
============================================================
📦 Security Tests
============================================================
  ✅ Should block dangerous os import
  ✅ Should block subprocess import
  ✅ Should block socket import
  ✅ Should block eval function
  ...

============================================================
📊 Test Results Summary
============================================================
✅ Passed: 10
❌ Failed: 0
📝 Total:  10
⏱️  Time:   0.15s
============================================================

✅ ALL TESTS PASSED!

╔════════════════════════════════════════════════════════════╗
║                  FINAL TEST SUMMARY                        ║
╚════════════════════════════════════════════════════════════╝

📦 Test Suites:
   ✅ Passed:  3
   ❌ Failed:  0
   📝 Total:   3

⏱️  Duration:  2.45s

✅ ALL TEST SUITES PASSED!

🎉 Platform is ready for deployment!
```

### Failed Test Run
```
  ❌ Should block dangerous os import
     Error: Code with os import should be blocked

============================================================
📊 Test Results Summary
============================================================
✅ Passed: 9
❌ Failed: 1
📝 Total:  10
============================================================

❌ TESTS FAILED!
```

---

## 🔧 Requirements

### To Run Tests
- **Node.js** 14+ installed
- **Python 3.x** installed (for level tests)
- **Dependencies installed** (`npm install`)

### Check Requirements
```bash
# Check Node.js
node --version

# Check Python
python3 --version

# Install dependencies
npm install
```

---

## 🐛 Debugging Failed Tests

### Test Fails: "Python not found"
```bash
# Install Python 3
# Windows: Download from python.org
# Mac: brew install python3
# Linux: sudo apt install python3
```

### Test Fails: "Module not found"
```bash
# Install dependencies
npm install
```

### Test Fails: Security tests
- Check `server.js` has correct security patterns
- Verify `isCodeSafe()` method exists
- Review forbidden patterns list

### Test Fails: Level tests
- Verify Python 3 is installed
- Check temp folder has write permissions
- Ensure Python code is syntactically correct

---

## 📝 Adding New Tests

### Example: Add a new security test

```javascript
runner.test('Should block urllib import', async () => {
    const code = 'import urllib';
    
    const { SecurePythonExecutor } = createMockExecutor();
    const executor = new SecurePythonExecutor();
    
    const isSafe = executor.isCodeSafe(code);
    Assert.false(isSafe, 'Code with urllib should be blocked');
});
```

### Example: Add a new level test

```javascript
runner.test('Level 13: New Feature - Description', async () => {
    const code = 'print("test code")';
    const result = await executeCode(code);
    
    Assert.true(result.success, 'Code should execute');
    Assert.equal(result.output.trim(), 'test code', 'Output should match');
});
```

---

## 🎯 Test Coverage

### Current Coverage

| Component | Tests | Coverage |
|-----------|-------|----------|
| Security Validation | 10 | ✅ High |
| File Structure | 9 | ✅ High |
| Level Solutions | 10 | ✅ Good |
| AI Helper Functions (no network) | 8 | ✅ High |
| API Endpoints | - | ⚠️ Manual |
| UI Components | - | ⚠️ Manual |

### What's NOT Tested (Requires Manual Testing)

- **Live API endpoints** (requires running server)
- **Browser UI interactions** (requires browser testing)
- **AI responses from OpenAI API** (real network calls and model behavior)
- **Real-time code execution** (requires full integration)

See [../docs/TESTING_GUIDE.md](../docs/TESTING_GUIDE.md) for manual testing procedures.

---

## 🔄 Continuous Integration

### Running in CI/CD

```yaml
# Example GitHub Actions
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - uses: actions/setup-python@v2
        with:
          python-version: '3.x'
      - run: npm install
      - run: npm test
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

1. **Run all tests**: `npm test`
2. **All tests pass**: ✅
3. **Manual UI testing**: [See TESTING_GUIDE.md](../docs/TESTING_GUIDE.md)
4. **Security review**: Verify forbidden patterns
5. **Documentation review**: Check all docs are up to date

---

## 📈 Test Statistics

### Test Execution Time (Approximate)

- **Security Tests**: ~0.1 seconds
- **API Tests**: ~0.2 seconds
- **Level Tests**: ~2-3 seconds (depends on Python execution)
- **Total**: ~2-4 seconds

### Test Reliability

- **Flaky Tests**: None (deterministic)
- **Platform-dependent**: Level tests (require Python)
- **Network-dependent**: None

---

## 🆘 Getting Help

### Test Issues?

1. Check [../docs/TESTING_GUIDE.md](../docs/TESTING_GUIDE.md)
2. Review error messages carefully
3. Run individual test files for details
4. Verify all requirements are installed

### Still Stuck?

- Ensure Python 3.x is in PATH
- Try `npm install` again
- Check file permissions on temp folder
- Review [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)

---

**Happy Testing! 🎉**

*Automated tests help ensure platform reliability and security.*
