const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Load environment variables - try .env first, then config.env
if (fs.existsSync('.env')) {
    require('dotenv').config({ path: '.env' });
} else {
    require('dotenv').config({ path: './config.env' });
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const DEFAULT_MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '500', 10);

const getTemperature = (fallback) => {
    const raw = process.env.TEMPERATURE;
    if (raw === undefined) return fallback;
    const value = parseFloat(raw);
    return Number.isNaN(value) ? fallback : value;
};

const getRandomSeed = () => {
    // OpenAI seed expects a 32-bit integer; use a large positive range
    return Math.floor(Math.random() * 1_000_000_000);
};

class AICodeValidator {
    constructor() {
        let apiKey = process.env.OPENAI_API_KEY || '';

        const isPlaceholder = (key) =>
            !key ||
            key === 'sk-your-key-here' ||
            key === 'sk-paste-your-key-here' ||
            key === 'sk-your-actual-api-key-here' ||
            key.startsWith('sk-your-');

        // If the env var is missing or clearly a placeholder, try to read directly from config.env
        // unless explicitly disabled for tests.
        let source = 'env';
        const skipConfigFallback = process.env.SKIP_OPENAI_CONFIG_FALLBACK_FOR_TESTS === '1';

        if (isPlaceholder(apiKey) && !skipConfigFallback) {
            source = 'config.env (fallback)';
            try {
                const envPath = path.join(__dirname, 'config.env');
                if (fs.existsSync(envPath)) {
                    const content = fs.readFileSync(envPath, 'utf8');
                    const line = content
                        .split(/\r?\n/)
                        .find(l => l.trim().startsWith('OPENAI_API_KEY='));
                    if (line) {
                        const fileKey = line.split('=', 2)[1].trim();
                        if (!isPlaceholder(fileKey)) {
                            apiKey = fileKey;
                        }
                    }
                }
            } catch (err) {
                console.warn('⚠️  Failed to read OPENAI_API_KEY from config.env:', err.message);
            }
        }

        const masked = apiKey ? `${apiKey.slice(0, 12)}...` : 'none';

        if (isPlaceholder(apiKey)) {
            console.warn(`⚠️  OpenAI API key not configured or placeholder value (source: ${source}, masked: ${masked}). AI features will be disabled.`);
            this.enabled = false;
            return;
        }
        
        // Force-set process.env so all modules (and future imports) see the real key
        process.env.OPENAI_API_KEY = apiKey;
        
        this.openai = new OpenAI({
            apiKey
        });
        this.enabled = true;
        console.log(`✅ OpenAI integration enabled! source=${source}, key=${masked}`);
    }

    async analyzeCode(code, level, levelDescription, expectedOutput) {
        if (!this.enabled) {
            return {
                success: false,
                message: 'OpenAI API key not configured'
            };
        }

        try {
            const prompt = this.buildPrompt(code, level, levelDescription, expectedOutput);
            
            const response = await this.openai.chat.completions.create({
                model: DEFAULT_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful Python programming tutor. Analyze student code, provide constructive feedback, and check if it meets the requirements. Be encouraging but specific about issues. Keep responses concise and educational."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: getTemperature(0.7),
                max_tokens: DEFAULT_MAX_TOKENS,
                seed: getRandomSeed()
            });

            const analysis = response.choices[0].message.content;
            
            return {
                success: true,
                analysis: analysis,
                tokens_used: response.usage.total_tokens
            };
            
        } catch (error) {
            console.error('OpenAI API Error:', error.message);
            const message = error && error.message ? error.message : '';
            const isAuthError =
                error && (error.status === 401 ||
                    (error.response && error.response.status === 401) ||
                    /incorrect api key provided/i.test(message));
            return {
                success: false,
                message: isAuthError
                    ? 'OpenAI API key not configured or invalid'
                    : `AI analysis failed: ${message}`
            };
        }
    }

    buildPrompt(code, level, levelDescription, expectedOutput) {
        return `
Level ${level}: ${levelDescription}

Expected Output:
${expectedOutput}

Student's Code:
\`\`\`python
${code}
\`\`\`

Please analyze this code and provide:
1. Does it solve the task correctly? (Yes/No)
2. Code quality assessment (brief)
3. Suggestions for improvement (if any)
4. Encouragement and next steps

Keep your response under 200 words and be encouraging!`;
    }

    async getSmartHint(level, levelDescription, currentCode) {
        if (!this.enabled) {
            return {
                success: false,
                message: 'OpenAI API key not configured'
            };
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: DEFAULT_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a patient Python tutor. Give helpful hints without revealing the complete solution. Guide students to discover the answer themselves."
                    },
                    {
                        role: "user",
                        content: `
Level ${level}: ${levelDescription}

Current student code:
\`\`\`python
${currentCode || '# No code yet'}
\`\`\`

Provide a helpful hint that guides them toward the solution without giving away the answer. Be specific about what Python concept or function they should explore. Keep it under 100 words.`
                    }
                ],
                temperature: getTemperature(0.8),
                max_tokens: DEFAULT_MAX_TOKENS,
                seed: getRandomSeed()
            });

            return {
                success: true,
                hint: response.choices[0].message.content
            };
            
        } catch (error) {
            console.error('OpenAI API Error:', error.message);
            const message = error && error.message ? error.message : '';
            const isAuthError =
                error && (error.status === 401 ||
                    (error.response && error.response.status === 401) ||
                    /incorrect api key provided/i.test(message));
            return {
                success: false,
                message: isAuthError
                    ? 'OpenAI API key not configured or invalid'
                    : `Hint generation failed: ${message}`
            };
        }
    }

    async validateAndExplain(code, level, levelDescription, expectedOutput, actualOutput) {
        if (!this.enabled) {
            return {
                success: false,
                message: 'OpenAI API key not configured'
            };
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: DEFAULT_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a smart Python homework evaluator. Judge whether the student's code correctly solves the task — focus strictly on LOGIC. The student passes if their loop, if/else, or try/except statements correctly handle all expected scenarios. Return ONLY valid JSON, no extra text."
                    },
                    {
                        role: "user",
                        content: `Level ${level}: ${levelDescription}

Sample Expected Output:
${expectedOutput}

Student's Code:
\`\`\`python
${code}
\`\`\`

Actual Output produced (IMPORTANT: This output is from ONLY ONE SINGLE TEST CASE via an automated script. DO NOT fail the student if the output doesn't show other branches like errors or 'less than', because the script only typed one input):
${actualOutput}

Evaluate: Does the student's code correctly implement the required logic for ALL cases? Look at the CODE logic, not just the single output. Is each scenario handled?

Respond in this exact JSON format:
{
  "passed": true or false,
  "explanation": "brief explanation of what the code does right or wrong",
  "suggestions": "specific improvement tip if failed, or encouragement if passed"
}`
                    }
                ],
                temperature: getTemperature(0.3),
                max_tokens: DEFAULT_MAX_TOKENS,
                seed: getRandomSeed()
            });

            const result = response.choices[0].message.content;
            
            // Strip markdown block format if present
            const cleanJson = result.replace(/```(?:json)?\n?/gi, '').replace(/```\n?$/g, '').trim();
            
            // Try to parse JSON response
            try {
                const parsed = JSON.parse(cleanJson);
                return {
                    success: true,
                    ...parsed
                };
            } catch {
                // If not JSON, return as text
                return {
                    success: true,
                    passed: false,
                    explanation: result
                };
            }
            
        } catch (error) {
            console.error('OpenAI API Error:', error.message);
            const message = error && error.message ? error.message : '';
            const isAuthError =
                error && (error.status === 401 ||
                    (error.response && error.response.status === 401) ||
                    /incorrect api key provided/i.test(message));
            return {
                success: false,
                message: isAuthError
                    ? 'OpenAI API key not configured or invalid'
                    : `Validation failed: ${message}`
            };
        }
    }

    async debugCode(code, error, level) {
        if (!this.enabled) {
            return {
                success: false,
                message: 'OpenAI API key not configured'
            };
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: DEFAULT_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a debugging hint helper. Explain the error in 2-3 short sentences. NO code blocks. NO full solutions. Only conceptual hints on what to fix."
                    },
                    {
                        role: "user",
                        content: `
Code (Level ${level}):
\`\`\`python
${code}
\`\`\`

Error: ${error}

Explain the error in 2-3 sentences. NO code. Hints only.`
                    }
                ],
                temperature: 0.5,
                max_tokens: 120,
                seed: getRandomSeed()
            });

            return {
                success: true,
                explanation: response.choices[0].message.content
            };
            
        } catch (error) {
            console.error('OpenAI API Error:', error.message);
            const message = error && error.message ? error.message : '';
            const isAuthError =
                error && (error.status === 401 ||
                    (error.response && error.response.status === 401) ||
                    /incorrect api key provided/i.test(message));
            return {
                success: false,
                message: isAuthError
                    ? 'OpenAI API key not configured or invalid'
                    : `Debug assistance failed: ${message}`
            };
        }
    }

    async chatTutor(message, code, level, context, expectedOutput) {
        if (!this.enabled) {
            return {
                success: false,
                message: 'OpenAI API key not configured'
            };
        }

        try {
            const levelInfo = level
                ? `Level ${level}: ${context || expectedOutput || ''}`.trim()
                : '';

            const parts = [];

            if (levelInfo) {
                parts.push(`Current Context: ${levelInfo}`);
            }

            if (code) {
                parts.push(`User's Current Code:\n\`\`\`python\n${code}\n\`\`\``);
            }

            parts.push(`User's Question: ${message}`);

            const prompt = `Act as an experienced teaching assistant / college buddy ("un cuate cacahuate de la uni") helping a student learn Python.
            
RULES (strictly follow these to maintain character):
- Speak like a friendly, slightly casual upperclassman who genuinely wants to see them succeed.
- Keep your answers SHORT and directly to the point. No verbosity. Imagine you are whispering advice during an exam.
- Teach them HOW TO THINK, rather than giving them the code. Explain the concept or the 'why'.
- DO NOT use placeholders like ___ or [your value] or give syntax skeletons anymore. Instead, guide their logic.
- NEVER give the full working solution or code snippets that solve the task. 
- If they are stuck on logic, ask them a guiding question or use a relatable analogy.

${parts.join('\\n\\n')}

Remember: short, direct, teach them how to think like a programmer, friendly TA vibe. Keep it concise!`;

            const response = await this.openai.chat.completions.create({
                model: DEFAULT_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Python SYNTAX GUIDE for beginners. Show syntax skeletons with blanks (___) so the student learns the structure without getting the full answer. Example: "try:\n    ___ = int(input(___))\nexcept ValueError:\n    print(___)" — never fill in the real values. Always leave the student something to figure out. Keep it short: skeleton + 1 sentence of explanation.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 180,
                temperature: 0.4,
                seed: getRandomSeed()
            });

            const aiResponse = response.choices[0].message.content;

            return {
                success: true,
                response: aiResponse
            };
        } catch (error) {
            console.error('OpenAI API Error:', error.message);
            const message = error && error.message ? error.message : '';
            const isAuthError =
                error && (error.status === 401 ||
                    (error.response && error.response.status === 401) ||
                    /incorrect api key provided/i.test(message));
            return {
                success: false,
                message: isAuthError
                    ? 'OpenAI API key not configured or invalid'
                    : `AI chat failed: ${message}`
            };
        }
    }
}

module.exports = AICodeValidator;
