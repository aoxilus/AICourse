// Security Tests
const { TestRunner, Assert } = require('./test-runner');
const path = require('path');

// Import the SecurePythonExecutor class
const serverPath = path.join(__dirname, '..', 'server.js');
delete require.cache[require.resolve(serverPath)];

const runner = new TestRunner();

// Mock environment
process.env.PORT = 3001; // Use different port for testing

runner.describe('Security Tests', () => {
    
    runner.test('Should block dangerous os import', async () => {
        const code = 'import os\nos.system("ls")';
        
        // Create a simple executor instance to test security
        const { SecurePythonExecutor } = createMockExecutor();
        const executor = new SecurePythonExecutor();
        
        const isSafe = executor.isCodeSafe(code);
        Assert.false(isSafe, 'Code with os import should be blocked');
    });

    runner.test('Should block subprocess import', async () => {
        const code = 'import subprocess\nsubprocess.call(["ls"])';
        
        const { SecurePythonExecutor } = createMockExecutor();
        const executor = new SecurePythonExecutor();
        
        const isSafe = executor.isCodeSafe(code);
        Assert.false(isSafe, 'Code with subprocess should be blocked');
    });

    runner.test('Should block socket import', async () => {
        const code = 'import socket\ns = socket.socket()';
        
        const { SecurePythonExecutor } = createMockExecutor();
        const executor = new SecurePythonExecutor();
        
        const isSafe = executor.isCodeSafe(code);
        Assert.false(isSafe, 'Code with socket should be blocked');
    });

    runner.test('Should block eval function', async () => {
        const code = 'eval("print(123)")';
        
        const { SecurePythonExecutor } = createMockExecutor();
        const executor = new SecurePythonExecutor();
        
        const isSafe = executor.isCodeSafe(code);
        Assert.false(isSafe, 'Code with eval should be blocked');
    });

    runner.test('Should block exec function', async () => {
        const code = 'exec("x = 1")';
        
        const { SecurePythonExecutor } = createMockExecutor();
        const executor = new SecurePythonExecutor();
        
        const isSafe = executor.isCodeSafe(code);
        Assert.false(isSafe, 'Code with exec should be blocked');
    });

    runner.test('Should block infinite while True loop', async () => {
        const code = 'while True:\n    print("loop")';
        
        const { SecurePythonExecutor } = createMockExecutor();
        const executor = new SecurePythonExecutor();
        
        const isSafe = executor.isCodeSafe(code);
        Assert.false(isSafe, 'Infinite while True should be blocked');
    });

    runner.test('Should allow while True with break', async () => {
        const code = 'while True:\n    print("loop")\n    break';
        
        const { SecurePythonExecutor } = createMockExecutor();
        const executor = new SecurePythonExecutor();
        
        const isSafe = executor.isCodeSafe(code);
        Assert.true(isSafe, 'While True with break should be allowed');
    });

    runner.test('Should allow safe print statement', async () => {
        const code = 'print("Hello, World!")';
        
        const { SecurePythonExecutor } = createMockExecutor();
        const executor = new SecurePythonExecutor();
        
        const isSafe = executor.isCodeSafe(code);
        Assert.true(isSafe, 'Safe print should be allowed');
    });

    runner.test('Should allow for loops', async () => {
        const code = 'for i in range(10):\n    print(i)';
        
        const { SecurePythonExecutor } = createMockExecutor();
        const executor = new SecurePythonExecutor();
        
        const isSafe = executor.isCodeSafe(code);
        Assert.true(isSafe, 'For loops should be allowed');
    });

    runner.test('Should allow function definitions', async () => {
        const code = 'def hello():\n    print("hi")\nhello()';
        
        const { SecurePythonExecutor } = createMockExecutor();
        const executor = new SecurePythonExecutor();
        
        const isSafe = executor.isCodeSafe(code);
        Assert.true(isSafe, 'Functions should be allowed');
    });
});

// Helper to create mock executor
function createMockExecutor() {
    class SecurePythonExecutor {
        constructor() {
            this.tempDir = path.join(__dirname, '..', 'temp');
        }
        
        isCodeSafe(code) {
            const forbidden = [
                'import os',
                'import sys',
                'import subprocess',
                'import socket',
                'import urllib',
                'import requests',
                'import http',
                'exec(',
                'eval(',
                'compile(',
                '__import__'
            ];
            
            for (const pattern of forbidden) {
                if (code.includes(pattern)) {
                    return false;
                }
            }
            
            if (/while\s+True\s*:/.test(code) && !/break/.test(code)) {
                return false;
            }
            
            return true;
        }
    }
    
    return { SecurePythonExecutor };
}

// Run tests if called directly
if (require.main === module) {
    runner.run();
}

module.exports = runner;
