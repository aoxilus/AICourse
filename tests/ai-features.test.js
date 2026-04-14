// AI Features Tests (OpenAI integration helpers)
const { TestRunner, Assert } = require('./test-runner');
const path = require('path');

const runner = new TestRunner();

// Ensure we always test the "no real API key"/disabled behaviour safely
const validatorPath = path.join(__dirname, '..', 'openai-validator.js');
const questionGenPath = path.join(__dirname, '..', 'ai-question-generator.js');

runner.describe('AI Helper Classes (OpenAI integration wrappers)', () => {
    runner.test('AICodeValidator: constructor disables when API key is placeholder', async () => {
        // Preserve original key
        const originalKey = process.env.OPENAI_API_KEY;
        const originalSkip = process.env.SKIP_OPENAI_CONFIG_FALLBACK_FOR_TESTS;
        try {
            // Use a known placeholder the class treats as "not configured"
            process.env.OPENAI_API_KEY = 'sk-your-key-here';
            process.env.SKIP_OPENAI_CONFIG_FALLBACK_FOR_TESTS = '1';
            delete require.cache[require.resolve(validatorPath)];
            const AICodeValidator = require(validatorPath);

            const validator = new AICodeValidator();
            Assert.false(validator.enabled, 'Validator should be disabled when API key is placeholder');
        } finally {
            // Restore original value and module
            if (originalKey === undefined) {
                delete process.env.OPENAI_API_KEY;
            } else {
                process.env.OPENAI_API_KEY = originalKey;
            }
            if (originalSkip === undefined) {
                delete process.env.SKIP_OPENAI_CONFIG_FALLBACK_FOR_TESTS;
            } else {
                process.env.SKIP_OPENAI_CONFIG_FALLBACK_FOR_TESTS = originalSkip;
            }
            delete require.cache[require.resolve(validatorPath)];
        }
    });

    runner.test('AICodeValidator: analyzeCode returns disabled message when AI is off', async () => {
        delete require.cache[require.resolve(validatorPath)];
        const AICodeValidator = require(validatorPath);
        const validator = new AICodeValidator();

        // Force-disable to avoid any external API usage
        validator.enabled = false;
        validator.openai = null;

        const result = await validator.analyzeCode('print(123)', 1, 'Test level', '123');
        Assert.false(result.success, 'analyzeCode should report failure when disabled');
        Assert.equal(
            result.message,
            'OpenAI API key not configured',
            'analyzeCode should explain that OpenAI is not configured'
        );
    });

    runner.test('AICodeValidator: getSmartHint returns disabled message when AI is off', async () => {
        delete require.cache[require.resolve(validatorPath)];
        const AICodeValidator = require(validatorPath);
        const validator = new AICodeValidator();

        validator.enabled = false;
        validator.openai = null;

        const result = await validator.getSmartHint(1, 'Print something', '');
        Assert.false(result.success, 'getSmartHint should report failure when disabled');
        Assert.equal(
            result.message,
            'OpenAI API key not configured',
            'getSmartHint should explain that OpenAI is not configured'
        );
    });

    runner.test('AICodeValidator: validateAndExplain returns disabled message when AI is off', async () => {
        delete require.cache[require.resolve(validatorPath)];
        const AICodeValidator = require(validatorPath);
        const validator = new AICodeValidator();

        validator.enabled = false;
        validator.openai = null;

        const result = await validator.validateAndExplain(
            'print(123)',
            1,
            'Print test',
            '123',
            '123'
        );
        Assert.false(result.success, 'validateAndExplain should report failure when disabled');
        Assert.equal(
            result.message,
            'OpenAI API key not configured',
            'validateAndExplain should explain that OpenAI is not configured'
        );
    });

    runner.test('AICodeValidator: debugCode returns disabled message when AI is off', async () => {
        delete require.cache[require.resolve(validatorPath)];
        const AICodeValidator = require(validatorPath);
        const validator = new AICodeValidator();

        validator.enabled = false;
        validator.openai = null;

        const result = await validator.debugCode('print(123)', 'Example error', 1);
        Assert.false(result.success, 'debugCode should report failure when disabled');
        Assert.equal(
            result.message,
            'OpenAI API key not configured',
            'debugCode should explain that OpenAI is not configured'
        );
    });

    runner.test('AICodeValidator: maps 401 invalid key error to friendly message', async () => {
        const originalKey = process.env.OPENAI_API_KEY;
        try {
            // Use a non-placeholder key so the validator enables itself
            process.env.OPENAI_API_KEY = 'sk-test-invalid-key';
            delete require.cache[require.resolve(validatorPath)];
            const AICodeValidator = require(validatorPath);
            const validator = new AICodeValidator();

            // Stub the OpenAI client to simulate a 401 auth error without real network calls
            validator.openai = {
                chat: {
                    completions: {
                        create: async () => {
                            const err = new Error('401 Incorrect API key provided: sk-test-invalid-key');
                            err.status = 401;
                            throw err;
                        }
                    }
                }
            };

            const result = await validator.analyzeCode('print(123)', 1, 'Level description', '123');
            Assert.false(result.success, 'analyzeCode should fail on 401 error');
            Assert.equal(
                result.message,
                'OpenAI API key not configured or invalid',
                '401 errors should be mapped to a friendly API key message'
            );
        } finally {
            if (originalKey === undefined) {
                delete process.env.OPENAI_API_KEY;
            } else {
                process.env.OPENAI_API_KEY = originalKey;
            }
            delete require.cache[require.resolve(validatorPath)];
        }
    });

    runner.test('AIQuestionGenerator: constructor disables when API key missing', async () => {
        const originalKey = process.env.OPENAI_API_KEY;
        try {
            delete process.env.OPENAI_API_KEY;
            delete require.cache[require.resolve(questionGenPath)];
            const AIQuestionGenerator = require(questionGenPath);

            const generator = new AIQuestionGenerator();
            Assert.false(generator.enabled, 'Question generator should be disabled without API key');
        } finally {
            if (originalKey === undefined) {
                delete process.env.OPENAI_API_KEY;
            } else {
                process.env.OPENAI_API_KEY = originalKey;
            }
            delete require.cache[require.resolve(questionGenPath)];
        }
    });

    runner.test('AIQuestionGenerator: generateQuestionVariation returns null when disabled', async () => {
        delete require.cache[require.resolve(questionGenPath)];
        const AIQuestionGenerator = require(questionGenPath);
        const generator = new AIQuestionGenerator();

        // Force-disable to avoid any external API usage
        generator.enabled = false;
        generator.openai = null;

        const variation = await generator.generateQuestionVariation(1, 'Base task', 'Concept');
        Assert.equal(variation, null, 'generateQuestionVariation should return null when disabled');
    });

    runner.test('AIQuestionGenerator: generateMultipleVariations returns empty list when disabled', async () => {
        delete require.cache[require.resolve(questionGenPath)];
        const AIQuestionGenerator = require(questionGenPath);
        const generator = new AIQuestionGenerator();

        generator.enabled = false;
        generator.openai = null;

        const variations = await generator.generateMultipleVariations(1, 'Base task', 'Concept', 2);
        Assert.ok(Array.isArray(variations), 'generateMultipleVariations should return an array');
        Assert.equal(variations.length, 0, 'Array should be empty when generator is disabled');
    });
});

// Run tests if called directly
if (require.main === module) {
    runner.run();
}

module.exports = runner;


