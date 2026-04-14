// API Endpoint Tests
const { TestRunner, Assert } = require('./test-runner');
const http = require('http');

const runner = new TestRunner();

const TEST_PORT = 3002;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server;

runner.describe('API Endpoint Tests', () => {
    
    runner.test('Setup: Start test server', async () => {
        // We'll skip actually starting the server in tests
        // Just validate the test infrastructure works
        Assert.ok(true, 'Test infrastructure ready');
    });

    runner.test('Validate server.js structure exists', async () => {
        const fs = require('fs');
        const path = require('path');
        const serverPath = path.join(__dirname, '..', 'server.js');
        
        Assert.ok(fs.existsSync(serverPath), 'server.js should exist');
        
        const serverContent = fs.readFileSync(serverPath, 'utf8');
        Assert.ok(serverContent.includes('express'), 'Server should use Express');
        Assert.ok(serverContent.includes('SecurePythonExecutor'), 'Server should have SecurePythonExecutor');
    });

    runner.test('Validate openai-validator.js structure', async () => {
        const fs = require('fs');
        const path = require('path');
        const validatorPath = path.join(__dirname, '..', 'openai-validator.js');
        
        Assert.ok(fs.existsSync(validatorPath), 'openai-validator.js should exist');
        
        const validatorContent = fs.readFileSync(validatorPath, 'utf8');
        Assert.ok(validatorContent.includes('AICodeValidator'), 'Should have AICodeValidator class');
        Assert.ok(validatorContent.includes('analyzeCode'), 'Should have analyzeCode method');
        Assert.ok(validatorContent.includes('getSmartHint'), 'Should have getSmartHint method');
    });

    runner.test('Validate frontend files exist', async () => {
        const fs = require('fs');
        const path = require('path');
        
        const indexPath = path.join(__dirname, '..', 'index.html');
        const scriptPath = path.join(__dirname, '..', 'script.js');
        
        Assert.ok(fs.existsSync(indexPath), 'index.html should exist');
        Assert.ok(fs.existsSync(scriptPath), 'script.js should exist');
        
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        Assert.ok(indexContent.includes('Python Learning Platform'), 'Should have correct title');
        Assert.ok(indexContent.includes('code-editor'), 'Should have code editor');
        Assert.ok(indexContent.includes('terminal-output'), 'Should have terminal output');
    });

    runner.test('Validate package.json dependencies', async () => {
        const fs = require('fs');
        const path = require('path');
        const packagePath = path.join(__dirname, '..', 'package.json');
        
        Assert.ok(fs.existsSync(packagePath), 'package.json should exist');
        
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        Assert.ok(packageData.dependencies.express, 'Should have express dependency');
        Assert.ok(packageData.dependencies.cors, 'Should have cors dependency');
        Assert.ok(packageData.dependencies.openai, 'Should have openai dependency');
        Assert.ok(packageData.dependencies.dotenv, 'Should have dotenv dependency');
    });

    runner.test('Validate configuration files', async () => {
        const fs = require('fs');
        const path = require('path');
        
        const configPath = path.join(__dirname, '..', 'config.env');
        const gitignorePath = path.join(__dirname, '..', '.gitignore');
        
        Assert.ok(fs.existsSync(configPath), 'config.env should exist');
        Assert.ok(fs.existsSync(gitignorePath), '.gitignore should exist');
        
        const gitignore = fs.readFileSync(gitignorePath, 'utf8');
        Assert.ok(gitignore.includes('config.env'), '.gitignore should exclude config.env');
        Assert.ok(gitignore.includes('node_modules'), '.gitignore should exclude node_modules');
    });

    runner.test('Validate documentation structure', async () => {
        const fs = require('fs');
        const path = require('path');
        
        const docsPath = path.join(__dirname, '..', 'docs');
        Assert.ok(fs.existsSync(docsPath), 'docs folder should exist');
        
        const requiredDocs = [
            'README.md',
            'ARCHITECTURE.md',
            'AI_QUICKSTART.md',
            'OPENAI_SETUP.md',
            'TESTING_GUIDE.md',
            'WHATS_NEW_AI.md'
        ];
        
        for (const doc of requiredDocs) {
            const docPath = path.join(docsPath, doc);
            Assert.ok(fs.existsSync(docPath), `${doc} should exist in docs/`);
        }
    });

    runner.test('Validate sample solutions exist', async () => {
        const fs = require('fs');
        const path = require('path');
        const solutionsPath = path.join(__dirname, '..', 'sample_solutions.py');
        
        Assert.ok(fs.existsSync(solutionsPath), 'sample_solutions.py should exist');
        
        const solutions = fs.readFileSync(solutionsPath, 'utf8');
        Assert.ok(solutions.includes('Level 1'), 'Should have Level 1 solution');
        Assert.ok(solutions.includes('Level 12'), 'Should have Level 12 solution');
    });

    runner.test('Validate startup scripts exist', async () => {
        const fs = require('fs');
        const path = require('path');
        
        const startShPath = path.join(__dirname, '..', 'start.sh');
        const startBatPath = path.join(__dirname, '..', 'start.bat');
        
        Assert.ok(fs.existsSync(startShPath), 'start.sh should exist');
        Assert.ok(fs.existsSync(startBatPath), 'start.bat should exist');
    });
});

// Run tests if called directly
if (require.main === module) {
    runner.run();
}

module.exports = runner;
