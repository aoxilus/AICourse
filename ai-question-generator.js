const OpenAI = require('openai');

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const DEFAULT_MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '400', 10);

const getTemperature = (fallback) => {
    const raw = process.env.TEMPERATURE;
    if (raw === undefined) return fallback;
    const value = parseFloat(raw);
    return Number.isNaN(value) ? fallback : value;
};

const getRandomSeed = () => {
    return Math.floor(Math.random() * 1_000_000_000);
};

const isPlaceholder = (key) =>
    !key ||
    key === 'sk-your-key-here' ||
    key === 'sk-paste-your-key-here' ||
    key === 'sk-your-actual-api-key-here' ||
    key.startsWith('sk-your-');

class AIQuestionGenerator {
    constructor() {
        let apiKey = process.env.OPENAI_API_KEY || '';

        if (isPlaceholder(apiKey)) {
            console.warn('⚠️  OpenAI API key not configured or placeholder. AI question generation disabled.');
            this.enabled = false;
            return;
        }

        const masked = apiKey ? `${apiKey.slice(0, 12)}...` : 'none';
        
        this.openai = new OpenAI({
            apiKey: apiKey
        });
        this.enabled = true;
        console.log(`✅ AI Question Generator enabled! key=${masked}`);
    }

    async generateQuestionVariation(level, baseTask, concept) {
        if (!this.enabled) {
            return null;
        }

        const levelTemplates = {
            1: {
                examples: [
                    "Print 'Hello, Python World!'",
                    "Print 'Hello World 123'",
                    "Print 'Hello\\nMy name is Python'",
                    "Print 'Today is a great day!'",
                    "Print 'Welcome to Python!'"
                ],
                concept: "basic print statements"
            },
            2: {
                examples: [
                    "Check if input is >10, <10, or not a number",
                    "Check if number is >5, <5, or invalid",
                    "Validate if input is positive, negative, or not numeric"
                ],
                concept: "input validation with conditionals"
            },
            3: {
                examples: [
                    "Print numbers 1-10",
                    "Print numbers 1-20",
                    "Print even numbers 2-10"
                ],
                concept: "for loops with range()"
            },
            4: {
                examples: [
                    "List 5 favorite foods",
                    "List 5 programming languages",
                    "List 5 colors"
                ],
                concept: "lists and enumeration"
            },
            5: {
                examples: [
                    "Create area calculation function",
                    "Create volume calculation function",
                    "Create perimeter calculation function"
                ],
                concept: "function definitions"
            },
            6: {
                examples: [
                    "Create student dictionary with grades",
                    "Create employee dictionary with salaries",
                    "Create product dictionary with prices"
                ],
                concept: "dictionaries and key-value pairs"
            },
            7: {
                examples: [
                    "Write and read a file",
                    "Create a log file",
                    "Save data to file"
                ],
                concept: "file I/O operations"
            },
            8: {
                examples: [
                    "Handle division by zero",
                    "Handle invalid input errors",
                    "Handle file not found errors"
                ],
                concept: "exception handling"
            },
            9: {
                examples: [
                    "Create a Car class",
                    "Create a Person class",
                    "Create a Book class"
                ],
                concept: "object-oriented programming"
            },
            10: {
                examples: [
                    "Analyze a list of numbers",
                    "Calculate statistics from data",
                    "Find min/max/average"
                ],
                concept: "data analysis with built-in functions"
            },
            11: {
                examples: [
                    "Display current date and time",
                    "Format datetime string",
                    "Show today's date"
                ],
                concept: "module imports (datetime)"
            },
            12: {
                examples: [
                    "Create a contact book",
                    "Create a todo list",
                    "Create a shopping cart"
                ],
                concept: "complete mini-project"
            }
        };

        const template = levelTemplates[level] || { examples: [], concept: concept };

        try {
            const prompt = `Generate a NEW Python programming task variation for Level ${level}.

Concept: ${template.concept || concept}
Base Task: ${baseTask}

Requirements:
- Must teach the same concept as the base task
- Should be different from: ${template.examples.slice(0, 3).join(', ')}
- Keep it beginner-friendly
- Provide a clear, specific instruction
- Example variations:
  * For printing: "Print 'Hello World 123'" or "Print 'Hello\\nMy name is\\nPython'"
  * For loops: "Print numbers 1-15" or "Print even numbers 2-20"
  * For functions: "Create calculate_perimeter function" or "Create multiply function"

Return ONLY a JSON object with this exact structure:
{
  "task": "the new task instruction",
  "expectedOutput": "example expected output",
  "hint": "helpful hint for the student",
  "starterCode": "# starter code comment"
}

Be creative but stay true to the level's learning objective.`;

            const response = await this.openai.chat.completions.create({
                model: DEFAULT_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a Python education expert. Generate creative but educational task variations that teach the same concept."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: getTemperature(0.9),
                max_tokens: DEFAULT_MAX_TOKENS,
                seed: getRandomSeed(),
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            const questionData = JSON.parse(content);

            return {
                success: true,
                task: questionData.task,
                expectedOutput: questionData.expectedOutput,
                hint: questionData.hint,
                starterCode: questionData.starterCode || "# Write your code here\n"
            };
        } catch (error) {
            console.error('AI question generation error:', error.message);
            return null;
        }
    }

    async generateMultipleVariations(level, baseTask, concept, count = 3) {
        const variations = [];
        for (let i = 0; i < count; i++) {
            const variation = await this.generateQuestionVariation(level, baseTask, concept);
            if (variation) {
                variations.push(variation);
            }
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return variations;
    }
}

module.exports = AIQuestionGenerator;



