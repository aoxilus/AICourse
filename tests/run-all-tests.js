#!/usr/bin/env node

// Master Test Runner - Runs all test suites
const { spawn } = require('child_process');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║       🐍 Python Learning Platform Test Suite              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

const testFiles = [
    'security.test.js',
    'api.test.js',
    'levels.test.js',
    'ai-features.test.js'
];

let totalPassed = 0;
let totalFailed = 0;
let completedTests = 0;

async function runTest(testFile) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Running ${testFile}...`);

        const testPath = path.join(__dirname, testFile);
        // Use the same Node binary that is running this script (works with bundled Node)
        const nodeExecutable = process.execPath || 'node';
        const child = spawn(nodeExecutable, [testPath], {
            stdio: 'inherit'
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${testFile} PASSED`);
                resolve({ passed: true });
            } else {
                console.log(`❌ ${testFile} FAILED`);
                resolve({ passed: false });
            }
        });

        child.on('error', (error) => {
            console.error(`Error running ${testFile}:`, error.message);
            resolve({ passed: false });
        });
    });
}

async function runAllTests() {
    const startTime = Date.now();
    let allPassed = true;

    for (const testFile of testFiles) {
        const result = await runTest(testFile);
        completedTests++;
        
        if (result.passed) {
            totalPassed++;
        } else {
            totalFailed++;
            allPassed = false;
        }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`
╔════════════════════════════════════════════════════════════╗
║                  FINAL TEST SUMMARY                        ║
╚════════════════════════════════════════════════════════════╝

📦 Test Suites:
   ✅ Passed:  ${totalPassed}
   ❌ Failed:  ${totalFailed}
   📝 Total:   ${testFiles.length}

⏱️  Duration:  ${duration}s

${allPassed ? '✅ ALL TEST SUITES PASSED!' : '❌ SOME TEST SUITES FAILED!'}

`);

    if (!allPassed) {
        console.log('💡 Tip: Run individual test files to see detailed errors:');
        console.log('   node tests/security.test.js');
        console.log('   node tests/api.test.js');
        console.log('   node tests/levels.test.js');
        console.log('   node tests/ai-features.test.js\n');
        process.exit(1);
    } else {
        console.log('🎉 Platform is ready for deployment!\n');
        process.exit(0);
    }
}

// Run all tests
runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});
