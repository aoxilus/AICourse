// Simple Test Runner - No external dependencies
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }

    describe(suiteName, testFn) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📦 ${suiteName}`);
        console.log('='.repeat(60));
        testFn();
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async run() {
        console.log('\n🚀 Starting Test Suite...\n');
        const startTime = Date.now();

        for (const test of this.tests) {
            try {
                await test.testFn();
                this.passed++;
                console.log(`  ✅ ${test.name}`);
                this.results.push({ name: test.name, status: 'PASS' });
            } catch (error) {
                this.failed++;
                console.log(`  ❌ ${test.name}`);
                console.log(`     Error: ${error.message}`);
                this.results.push({ name: test.name, status: 'FAIL', error: error.message });
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n' + '='.repeat(60));
        console.log('📊 Test Results Summary');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📝 Total:  ${this.tests.length}`);
        console.log(`⏱️  Time:   ${duration}s`);
        console.log('='.repeat(60));

        if (this.failed > 0) {
            console.log('\n❌ TESTS FAILED!\n');
            process.exit(1);
        } else {
            console.log('\n✅ ALL TESTS PASSED!\n');
            process.exit(0);
        }
    }
}

// Simple assertions
class Assert {
    static equal(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
        }
    }

    static notEqual(actual, notExpected, message = '') {
        if (actual === notExpected) {
            throw new Error(`${message}\nExpected not to equal: ${notExpected}`);
        }
    }

    static true(value, message = '') {
        if (value !== true) {
            throw new Error(`${message}\nExpected true, got ${value}`);
        }
    }

    static false(value, message = '') {
        if (value !== false) {
            throw new Error(`${message}\nExpected false, got ${value}`);
        }
    }

    static ok(value, message = '') {
        if (!value) {
            throw new Error(`${message}\nExpected truthy value, got ${value}`);
        }
    }

    static includes(array, value, message = '') {
        if (!array.includes(value)) {
            throw new Error(`${message}\nExpected array to include: ${value}`);
        }
    }

    static match(string, regex, message = '') {
        if (!regex.test(string)) {
            throw new Error(`${message}\nExpected string to match regex: ${regex}`);
        }
    }

    static async rejects(promise, message = '') {
        try {
            await promise;
            throw new Error(`${message}\nExpected promise to reject`);
        } catch (error) {
            // Expected to throw
            return;
        }
    }
}

module.exports = { TestRunner, Assert };
