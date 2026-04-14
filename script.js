// Python Learning Platform JavaScript
class PythonLearningPlatform {
    constructor() {
        this.currentLevel = 1;
        this.levels = this.initializeLevels();
        this.aiEnabled = false;
        this.completedLevels = [];
        this.userId = null;
        this.draftByLevel = {};
        this.pendingCodeExecution = null;
        this.draftSaveTimeout = null;
        this.init();
    }
    
    async init() {
        await this.loadSession();
        await this.checkAIStatus();
        this.renderLevelCards();
        this.updateProgress();
        this.bindEvents();
        this.restoreSavedLevel();
    }

    restoreSavedLevel() {
        const hasSavedDraft = this.draftByLevel && this.draftByLevel[this.currentLevel];
        if (this.currentLevel > 1 || hasSavedDraft) {
            setTimeout(() => {
                this.selectLevel(this.currentLevel);
            }, 0);
        }
    }
    
    async loadSession() {
        try {
            const response = await fetch('/api/session', {
                credentials: 'include'
            });
            const session = await response.json();
            this.userId = session.userId;
            this.completedLevels = session.completedLevels || [];
            this.currentLevel = session.currentLevel || this.currentLevel;
            this.draftByLevel = session.draftByLevel || {};
            const userLabel = document.getElementById('main-user-label');
            if (userLabel && session.profileName && session.profileEmail) {
                userLabel.textContent = `${session.profileName} (${session.profileEmail})`;
            }
            
            // Sync with localStorage for backward compatibility
            const localCompleted = JSON.parse(localStorage.getItem('completedLevels') || '[]');
            if (localCompleted.length > this.completedLevels.length) {
                // If localStorage has more, sync to server
                this.completedLevels = localCompleted;
                await this.saveProgress();
            } else {
                // Otherwise, use server data
                localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
            }
            localStorage.setItem('draftByLevel', JSON.stringify(this.draftByLevel || {}));
        } catch (error) {
            console.error('Failed to load session:', error);
            // Fallback to localStorage
            this.completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
            this.draftByLevel = JSON.parse(localStorage.getItem('draftByLevel') || '{}');
        }
    }
    
    async saveProgress() {
        try {
            await fetch('/api/session/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ completedLevels: this.completedLevels })
            });
            // Also save to localStorage for backward compatibility
            localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
        } catch (error) {
            console.error('Failed to save progress:', error);
            // Fallback to localStorage only
            localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
        }
    }

    async saveDraft(levelId, code) {
        const parsedLevel = parseInt(levelId, 10);
        if (!Number.isInteger(parsedLevel) || parsedLevel < 1) {
            return;
        }

        this.draftByLevel[parsedLevel] = code;
        localStorage.setItem('draftByLevel', JSON.stringify(this.draftByLevel));

        try {
            await fetch('/api/session/draft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    levelId: parsedLevel,
                    code: code
                })
            });
        } catch (error) {
            console.error('Failed to save code draft:', error);
        }
    }
    
    async checkAIStatus() {
        try {
            const response = await fetch('/ai-status');
            const result = await response.json();
            this.aiEnabled = result.enabled;

            const aiBadge = document.getElementById('ai-badge');
            const aiStatusBadge = document.getElementById('ai-status-badge');
            const aiReviewBtn = document.getElementById('ai-review');
            const chatMessages = document.getElementById('ai-chat-messages');

            if (this.aiEnabled) {
                console.log('🤖 AI features enabled!');
                if (aiBadge) aiBadge.classList.remove('d-none');
                if (aiStatusBadge) aiStatusBadge.classList.remove('d-none');
                if (aiReviewBtn) aiReviewBtn.classList.remove('d-none');
            } else {
                if (aiBadge) aiBadge.classList.add('d-none');
                if (aiStatusBadge) aiStatusBadge.classList.add('d-none');
                if (aiReviewBtn) aiReviewBtn.classList.add('d-none');
                if (chatMessages) {
                    chatMessages.innerHTML = `
                        <div class="alert alert-warning mb-2">
                            <small>⚠️ AI Chat is disabled. Configure OpenAI API key in config.env to enable AI features.</small>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.log('AI features not available');
        }
    }

    initializeLevels() {
        return [
            {
                id: 1,
                title: "🖨️ Print Master",
                emoji: "🖨️",
                description: "Learn the basics of printing in Python. Your task is to print the exact message shown in the expected output.",
                task: "Print 'Hello, Python World!' to the console",
                expectedOutput: "Hello, Python World!",
                hint: "Use the print() function with the text in quotes",
                manualTip: "print(\"Hello!\")",
                manualLink: "https://docs.python.org/3/library/functions.html#print",
                starterCode: "# Write your code here\n",
                medal: "⌨️"
            },
            {
                id: 2,
                title: "🔍 Number Detective",
                emoji: "🔍",
                description: "Create a program that checks user input and determines if it's greater than 10, less than 10, or not a number at all.",
                task: "Ask for user input and check: >10 (print 'bigger than 10'), <10 (print 'less than 10'), or not a number (print 'hey this is not a number')",
                expectedOutput: "Enter a number: 15\nbigger than 10",
                hint: "Use input(), try/except for number validation, and if/elif/else statements",
                manualTip: "try:\n    x = int(input(\"Pick: \"))\n    if x > 3:\n        print(\"Big\")\n    elif x == 3:\n        print(\"Three\")\n    else:\n        print(\"Small\")\nexcept ValueError:\n    print(\"Not a number\")",
                manualLink: "https://docs.python.org/3/tutorial/controlflow.html#if-statements",
                starterCode: "# Get user input and validate it\nuser_input = input(\"Enter a number: \")\n\n# Your code here\n",
                medal: "🤖"
            },
            {
                id: 3,
                title: "🔁 Loop Explorer",
                emoji: "🔄",
                description: "Master the art of loops by printing numbers in sequence.",
                task: "Use a for loop to print numbers from 1 to 10, each on a new line",
                expectedOutput: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10",
                hint: "Use for i in range(1, 11): and print(i)",
                manualTip: "# Loop 1 to 3\nfor i in range(1, 4):\n    print(i)",
                manualLink: "https://docs.python.org/3/tutorial/controlflow.html#for-statements",
                starterCode: "# Use a for loop to print numbers 1-10\n",
                medal: "🔁"
            },
            {
                id: 4,
                title: "📝 List Builder",
                emoji: "📝",
                description: "Work with Python lists to store and display data.",
                task: "Create a list with 5 favorite foods and print each food with its position (1. Apple, 2. Pizza, etc.)",
                expectedOutput: "1. Apple\n2. Pizza\n3. Pasta\n4. Burger\n5. Ice Cream",
                hint: "Create a list and use enumerate() or a counter in your loop",
                manualTip: "fruits = [\"apple\", \"banana\"]\nfor count, fruit in enumerate(fruits, 1):\n    print(f\"{count}. {fruit}\")",
                manualLink: "https://docs.python.org/3/tutorial/datastructures.html#more-on-lists",
                starterCode: "# Create a list of 5 favorite foods\nfoods = []\n\n# Print each food with its number\n",
                medal: "📝"
            },
            {
                id: 5,
                title: "⚙️ Function Creator",
                emoji: "⚙️",
                description: "Learn to create reusable code with functions.",
                task: "Create a function called 'calculate_area' that takes width and height, returns the area, then call it with width=5, height=3",
                expectedOutput: "The area is: 15",
                hint: "def calculate_area(width, height): return width * height",
                manualTip: "def add_nums(a, b):\n    return a + b\n\nres = add_nums(1, 2)\nprint(res)",
                manualLink: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions",
                starterCode: "# Define your function here\n\n# Call the function and print the result\n",
                medal: "🧩"
            },
            {
                id: 6,
                title: "📚 Dictionary Master",
                emoji: "📚",
                description: "Store and retrieve data using Python dictionaries.",
                task: "Create a dictionary with 3 students and their grades, then print each student's grade",
                expectedOutput: "Alice: 95\nBob: 87\nCharlie: 92",
                hint: "Use a dictionary like {'Alice': 95} and loop through items()",
                manualTip: "stats = {\"level\": 1, \"hp\": 100}\nfor key, val in stats.items():\n    print(f\"{key}: {val}\")",
                manualLink: "https://docs.python.org/3/tutorial/datastructures.html#dictionaries",
                starterCode: "# Create a dictionary of students and grades\nstudents = {}\n\n# Print each student and their grade\n",
                medal: "🗂️"
            },
            {
                id: 7,
                title: "📄 File Handler",
                emoji: "📄",
                description: "Learn to work with files - writing and reading data.",
                task: "Write 'Python is awesome!' to a file called 'message.txt', then read and print its contents",
                expectedOutput: "File created successfully!\nFile contents: Python is awesome!",
                hint: "Use open() with 'w' mode to write, then 'r' mode to read",
                manualTip: "with open(\"test.txt\", \"w\") as f:\n    f.write(\"Hi\")\n\nwith open(\"test.txt\", \"r\") as f:\n    print(f.read())",
                manualLink: "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files",
                starterCode: "# Write to file\n\n# Read from file\n",
                medal: "📁"
            },
            {
                id: 8,
                title: "🛡️ Error Guardian",
                emoji: "🛡️",
                description: "Handle errors gracefully with exception handling.",
                task: "Create a calculator that divides two numbers but handles division by zero",
                expectedOutput: "Enter first number: 10\nEnter second number: 0\nError: Cannot divide by zero!",
                hint: "Use try/except blocks to catch ZeroDivisionError",
                manualTip: "try:\n    num = int(input(\"Num: \"))\n    print(10 / num)\nexcept ZeroDivisionError:\n    print(\"No zeros!\")\nexcept ValueError:\n    print(\"Numbers only!\")",
                manualLink: "https://docs.python.org/3/tutorial/errors.html#handling-exceptions",
                starterCode: "# Get two numbers from user\n# Handle division by zero\n",
                medal: "🛡️"
            },
            {
                id: 9,
                title: "🏗️ Class Architect",
                emoji: "🏗️",
                description: "Build your first class with methods and attributes.",
                task: "Create a Car class with brand, model attributes and a start_engine() method",
                expectedOutput: "Car created: Toyota Camry\nToyota Camry engine started!",
                hint: "Use class Car: with __init__ method and define start_engine method",
                manualTip: "class Cat:\n    def __init__(self, name):\n        self.name = name\n    def meow(self):\n        print(f\"{self.name} says meow!\")\n\nc = Cat(\"Luna\")\nc.meow()",
                manualLink: "https://docs.python.org/3/tutorial/classes.html#class-objects",
                starterCode: "# Define your Car class here\n\n# Create a car instance and test it\n",
                medal: "🏗️"
            },
            {
                id: 10,
                title: "📊 Data Analyzer",
                emoji: "📊",
                description: "Analyze a dataset using built-in Python functions.",
                task: "Given a list of numbers [23, 45, 12, 67, 34, 89, 56], calculate and print sum, average, max, and min",
                expectedOutput: "Numbers: [23, 45, 12, 67, 34, 89, 56]\nSum: 326\nAverage: 46.57\nMax: 89\nMin: 12",
                hint: "Use sum(), len(), max(), min() functions and round for average",
                manualTip: "nums = [1, 2, 3]\nprint(sum(nums))\nprint(max(nums))\nprint(min(nums))\nprint(sum(nums)/len(nums))",
                manualLink: "https://docs.python.org/3/library/functions.html",
                starterCode: "numbers = [23, 45, 12, 67, 34, 89, 56]\n\n# Calculate statistics\n",
                medal: "📈"
            },
            {
                id: 11,
                title: "📦 Module Master",
                emoji: "📦",
                description: "Import and use Python's built-in modules.",
                task: "Use the datetime module to display current date and time in format: 'Today is: YYYY-MM-DD HH:MM:SS'",
                expectedOutput: "Today is: 2024-12-03 14:30:25",
                hint: "Import datetime and use datetime.now().strftime()",
                manualTip: "import datetime\nnow = datetime.datetime.now()\nprint(f\"Time: {now.strftime('%H:%M:%S')}\")",
                manualLink: "https://docs.python.org/3/tutorial/modules.html",
                starterCode: "# Import the datetime module\n\n# Get and format current datetime\n",
                medal: "📦"
            },
            {
                id: 12,
                title: "👑 Project Champion",
                emoji: "👑",
                description: "Create a mini contact book combining all your Python skills!",
                task: "Create a contact book that can add a contact (name, phone) and display all contacts",
                expectedOutput: "Contact Book\n1. Add Contact\n2. View Contacts\nChoice: 1\nName: John\nPhone: 123-456-7890\nContact added!\n\nChoice: 2\nContacts:\n1. John - 123-456-7890",
                hint: "Use a list of dictionaries, functions, loops, and input validation",
                manualTip: "data = []\nwhile True:\n    val = input(\"Add (or 'q'): \")\n    if val == 'q':\n        break\n    data.append({\"item\": val})\nprint(data)",
                manualLink: "https://docs.python.org/3/tutorial/index.html",
                starterCode: "# Contact book project\ncontacts = []\n\n# Your functions and main program here\n",
                medal: "🏆"
            }
        ];
    }


    bindEvents() {
        document.getElementById('back-btn').addEventListener('click', () => this.showLevelSelection());
        document.getElementById('run-code').addEventListener('click', () => this.runCode());
        document.getElementById('submit-code').addEventListener('click', () => this.submitCode());
        document.getElementById('reset-session-btn')?.addEventListener('click', () => this.resetSession());
        document.getElementById('ai-new-question-btn')?.addEventListener('click', () => this.generateNewAIQuestion());
        document.getElementById('ai-hint').addEventListener('click', () => this.showHint());
        document.getElementById('ai-review').addEventListener('click', () => this.aiAnalyzeCode());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('submit-to-terminal').addEventListener('click', () => this.submitInputToTerminal());
        
        // AI Chat
        document.getElementById('ai-chat-send').addEventListener('click', () => this.sendAIChatMessage());
        document.getElementById('ai-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAIChatMessage();
            }
        });
        
        // Check for input() calls when code changes (debounced to avoid interference)
        let inputCheckTimeout;
        document.getElementById('code-editor').addEventListener('input', () => {
            clearTimeout(inputCheckTimeout);
            inputCheckTimeout = setTimeout(() => {
                this.checkForInputCalls();
            }, 300);

            clearTimeout(this.draftSaveTimeout);
            this.draftSaveTimeout = setTimeout(() => {
                const code = document.getElementById('code-editor').value;
                this.saveDraft(this.currentLevel, code);
            }, 400);
        });
        
        // Allow Enter key to submit input
        document.getElementById('user-input-field').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitInputToTerminal();
            }
        });
    }

    async resetSession() {
        const confirmed = window.confirm('Reset your completed progress for this user session?');
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch('/api/session/reset', {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to reset session');
            }

            this.completedLevels = [];
            this.currentLevel = 1;
            this.draftByLevel = {};
            localStorage.setItem('completedLevels', JSON.stringify([]));
            localStorage.setItem('draftByLevel', JSON.stringify({}));
            this.renderLevelCards();
            this.updateProgress();
            this.showLevelSelection();
            const output = document.getElementById('terminal-output');
            if (output) {
                output.value = '>>> Session reset. Progress is now 0/12.';
            }
        } catch (error) {
            alert(`Could not reset session: ${error.message}`);
        }
    }

    renderLevelCards() {
        const container = document.getElementById('level-cards');
        container.innerHTML = '';

        this.levels.forEach(level => {
            const isCompleted = this.completedLevels.includes(level.id);
            const isLocked = level.id > 1 && !this.completedLevels.includes(level.id - 1);
            
            const card = document.createElement('div');
            card.className = 'col-md-4 col-lg-3 mb-4';
            card.innerHTML = `
                <div class="card level-card ${isCompleted ? 'level-completed' : ''} ${isLocked ? 'level-locked' : ''}" 
                     onclick="${isLocked ? '' : `app.selectLevel(${level.id})`}">
                    <div class="card-body text-center">
                        <div class="display-4 mb-2">${level.emoji}</div>
                        <h6 class="card-title">${level.title}</h6>
                        <div class="mt-2">
                            ${isCompleted ? `<span class="medal">${level.medal}</span>` : ''}
                            ${isLocked ? '<span class="text-muted">🔒 Locked</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    selectLevel(levelId) {
        const codeEditor = document.getElementById('code-editor');
        if (codeEditor && codeEditor.value) {
            this.saveDraft(this.currentLevel, codeEditor.value);
        }

        this.currentLevel = levelId;
        const level = this.levels.find(l => l.id === levelId);
        
        document.getElementById('level-selection').classList.add('d-none');
        document.getElementById('level-interface').classList.remove('d-none');
        
        document.getElementById('current-level-title').textContent = level.title;
        document.getElementById('level-description').innerHTML = `
            <h6>${level.emoji} ${level.task}</h6>
            <p class="mb-2">${level.description}</p>
            ${level.manualTip ? `
            <div class="p-2 mb-2 bg-dark rounded" style="font-size: 0.85rem; border: 1px solid #4a5568;">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-warning fw-bold" style="font-size: 0.8rem;">📖 Quick Reference:</span>
                    ${level.manualLink ? `<a href="${level.manualLink}" target="_blank" class="text-info" style="font-size: 0.75rem; text-decoration: none;">📘 Official Docs ↗</a>` : ''}
                </div>
                <code class="text-light" style="white-space: pre-wrap; font-family: 'Courier New', monospace;">${level.manualTip}</code>
            </div>` : ''}
        `;
        document.getElementById('expected-output').textContent = level.expectedOutput;
        const savedDraft = this.draftByLevel[levelId];
        document.getElementById('code-editor').value = (typeof savedDraft === 'string' && savedDraft.length > 0) ? savedDraft : level.starterCode;
        document.getElementById('terminal-output').value = '';
        
        // Hide input field and clear pending execution when switching levels
        document.getElementById('user-input-container').classList.add('d-none');
        this.pendingCodeExecution = null;
        
        // Clear chat and add welcome message for this level
        const chatMessages = document.getElementById('ai-chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="alert alert-info mb-2">
                    <small>👋 Hi! I'm your AI chat assistant for <strong>${level.title}</strong>. Ask me anything about this level, get help with your code, or request explanations!</small>
                </div>
            `;
        }
        
        // Check if code contains input() and show input field
        this.checkForInputCalls();
    }

    setEditorCode(code) {
        const codeEditor = document.getElementById('code-editor');
        if (!codeEditor) {
            return;
        }

        codeEditor.value = code;
        this.checkForInputCalls();
        this.saveDraft(this.currentLevel, code);
    }
    
    checkForInputCalls() {
        const codeEditor = document.getElementById('code-editor');
        const code = codeEditor.value;
        const hasInput = /input\s*\(/.test(code);
        const inputContainer = document.getElementById('user-input-container');
        const inputField = document.getElementById('user-input-field');
        
        if (hasInput) {
            inputContainer.classList.remove('d-none');
            inputField.focus();
        } else {
            inputContainer.classList.add('d-none');
        }
    }

    showLevelSelection() {
        document.getElementById('level-selection').classList.remove('d-none');
        document.getElementById('level-interface').classList.add('d-none');
    }

    async runCode() {
        const code = document.getElementById('code-editor').value;
        const output = document.getElementById('terminal-output');
        const hasInput = /input\s*\(/.test(code);
        
        // Extract prompt from input() if present
        let promptText = '';
        if (hasInput) {
            const inputMatch = code.match(/input\s*\(\s*["']([^"']*)["']\s*\)/);
            promptText = inputMatch ? inputMatch[1] : '';
        }
        
        // If code has input(), show prompt and input field (W3Schools style)
        if (hasInput) {
            // Show the prompt in terminal output (like W3Schools does)
            if (promptText) {
                output.value = `>>> ${promptText}`;
            } else {
                output.value = '>>> ';
            }
            this.checkForInputCalls();
            this.pendingCodeExecution = { type: 'run', code: code };
            return;
        }
        
        output.value = '>>> Running code...\n';
        
        try {
            const response = await fetch('/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ code: code, level: this.currentLevel })
            });
            
            if (!response.ok) {
                const text = await response.text();
                output.value = `>>> Server Error (${response.status}):\n${text.substring(0, 200)}`;
                return;
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                output.value = `>>> Server returned non-JSON response:\n${text.substring(0, 200)}`;
                return;
            }
            
            const result = await response.json();
            
            if (result.success) {
                output.value = `>>> ${result.output}`;
            } else {
                output.value = `>>> Error:\n${result.error}`;
            }
        } catch (error) {
            output.value = `>>> Connection Error:\n${error.message}\n\nMake sure the server is running on port 3000.`;
        }
    }
    
    async submitInputToTerminal() {
        const userInputField = document.getElementById('user-input-field');
        const submitButton = document.getElementById('submit-to-terminal');
        const inputContainer = document.getElementById('user-input-container');
        const userInput = userInputField.value;
        const output = document.getElementById('terminal-output');
        
        if (!this.pendingCodeExecution) {
            // If no pending execution, just run with input
            const code = document.getElementById('code-editor').value;
            this.pendingCodeExecution = { type: 'run', code: code };
        }
        
        if (!userInput.trim() && this.pendingCodeExecution) {
            output.value += '\n>>> Please enter a value before submitting.';
            userInputField.focus();
            return; // Don't show error, just wait for input
        }
        
        const { type, code } = this.pendingCodeExecution;
        this.pendingCodeExecution = null;

        userInputField.disabled = true;
        if (submitButton) {
            submitButton.disabled = true;
        }

        // Append user input to terminal (W3Schools style - shows what user typed)
        output.value += `${userInput}\n`;
        
        try {
            const requestBody = { 
                code: code, 
                level: this.currentLevel,
                userInput: userInput
            };
            
            if (type === 'submit') {
                requestBody.submit = true;
                const level = this.levels.find(l => l.id === this.currentLevel);
                if (level.aiGeneratedExpectedOutput) {
                    requestBody.aiExpectedOutput = level.aiGeneratedExpectedOutput;
                    requestBody.aiTask = level.task;
                }
            }
            
            const response = await fetch('/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const text = await response.text();
                output.value += `\n>>> Server Error (${response.status}):\n${text.substring(0, 200)}`;
                return;
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                output.value += `\n>>> Server returned non-JSON response:\n${text.substring(0, 200)}`;
                return;
            }
            
            const result = await response.json();
            
            if (type === 'submit') {
                // Handle submission result
                if (result.success && result.passed) {
                    let feedbackMsg = '';
                    if (result.aiAnalysis) {
                        feedbackMsg = `\n\n🤖 AI Feedback:\n${result.aiAnalysis}`;
                    }
                    if (result.aiSuggestions) {
                        feedbackMsg += `\n\n💡 Suggestions:\n${result.aiSuggestions}`;
                    }
                    output.value += `${result.output}${feedbackMsg}`;
                    userInputField.value = '';
                    inputContainer.classList.add('d-none');
                    this.completeLevel(this.currentLevel);
                } else {
                    let errorMsg = `\n❌ Submission Failed:\n${result.error || 'Output does not match expected result'}`;
                    if (result.aiDebugHelp) {
                        errorMsg += `\n\n🤖 AI Debug Help:\n${result.aiDebugHelp}`;
                    }
                    if (result.aiAnalysis) {
                        errorMsg += `\n\n🤖 AI Analysis:\n${result.aiAnalysis}`;
                    }
                    output.value += errorMsg;
                    userInputField.value = userInput;
                    inputContainer.classList.remove('d-none');
                }
            } else {
                // Handle run result (W3Schools style - clean output)
                if (result.success) {
                    output.value += result.output;
                    userInputField.value = '';
                    inputContainer.classList.add('d-none');
                } else {
                    output.value += `\nError: ${result.error}`;
                    userInputField.value = userInput;
                    inputContainer.classList.remove('d-none');
                }
            }
        } catch (error) {
            output.value += `\nConnection Error: ${error.message}`;
            userInputField.value = userInput;
            inputContainer.classList.remove('d-none');
        } finally {
            userInputField.disabled = false;
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    async submitCode() {
        const code = document.getElementById('code-editor').value;
        const output = document.getElementById('terminal-output');
        const hasInput = /input\s*\(/.test(code);
        
        // Extract prompt from input() if present
        let promptText = '';
        if (hasInput) {
            const inputMatch = code.match(/input\s*\(\s*["']([^"']*)["']\s*\)/);
            promptText = inputMatch ? inputMatch[1] : '';
        }
        
        // If code has input(), show prompt and input field (W3Schools style)
        if (hasInput) {
            // Show the prompt in terminal output (like W3Schools does)
            if (promptText) {
                output.value = `>>> ${promptText}`;
            } else {
                output.value = '>>> ';
            }
            this.checkForInputCalls();
            this.pendingCodeExecution = { type: 'submit', code: code };
            return;
        }
        
        const level = this.levels.find(l => l.id === this.currentLevel);
        output.value = '>>> Submitting code for evaluation...\n';
        
        try {
            // Include AI-generated question data if available
            const submitData = {
                code: code,
                level: this.currentLevel,
                submit: true
            };
            
            if (level.aiGeneratedExpectedOutput) {
                submitData.aiExpectedOutput = level.aiGeneratedExpectedOutput;
                submitData.aiTask = level.task;
            }
            
            const response = await fetch('/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(submitData)
            });
            
            if (!response.ok) {
                const text = await response.text();
                output.value = `>>> Server Error (${response.status}):\n${text.substring(0, 200)}`;
                return;
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                output.value = `>>> Server returned non-JSON response:\n${text.substring(0, 200)}`;
                return;
            }
            
            const result = await response.json();
            
            // For AI-generated questions, use AI validation result
            if (level.aiGeneratedExpectedOutput && this.aiEnabled) {
                // Use AI validation if available
                if (result.aiPassed !== undefined) {
                    if (result.aiPassed) {
                        output.value = `>>> ✅ Success!\n${result.output}`;
                        if (result.aiAnalysis) {
                            output.value += `\n\n🤖 AI Feedback:\n${result.aiAnalysis}`;
                        }
                        this.completeLevel(this.currentLevel);
                        return;
                    } else {
                        output.value = `>>> ❌ Submission Failed:\n${result.error || 'Output does not match expected result'}`;
                        if (result.aiAnalysis) {
                            output.value += `\n\n🤖 AI Feedback:\n${result.aiAnalysis}`;
                        }
                        return;
                    }
                }
            }
            
            if (result.success && result.passed) {
                // Show AI feedback if available
                let feedbackMsg = '';
                if (result.aiAnalysis) {
                    feedbackMsg = `\n\n🤖 AI Feedback:\n${result.aiAnalysis}`;
                }
                if (result.aiSuggestions) {
                    feedbackMsg += `\n\n💡 Suggestions:\n${result.aiSuggestions}`;
                }
                
                if (feedbackMsg) {
                    output.value = `>>> ✅ Success!\n${result.output}${feedbackMsg}`;
                }
                
                this.completeLevel(this.currentLevel);
            } else {
                let errorMsg = `>>> ❌ Submission Failed:\n${result.error || 'Output does not match expected result'}`;
                
                // Add AI debugging help if available
                if (result.aiDebugHelp) {
                    errorMsg += `\n\n🤖 AI Debug Help:\n${result.aiDebugHelp}`;
                }
                
                // Add AI analysis if available
                if (result.aiAnalysis) {
                    errorMsg += `\n\n🤖 AI Analysis:\n${result.aiAnalysis}`;
                }
                
                output.value = errorMsg;
            }
        } catch (error) {
            output.value = `>>> Connection Error:\n${error.message}\n\nMake sure the server is running on port 3000. Run: npm start`;
        }
    }

    async showHint() {
        const code = document.getElementById('code-editor').value;
        const level = this.levels.find(l => l.id === this.currentLevel);

        // Fallback to static hint if AI disabled
        if (!this.aiEnabled) {
            const hintText = level && level.hint
                ? level.hint
                : 'Hints are not available for this level.';
            this.showModal('Hint', hintText);
            return;
        }

        try {
            const hintBtn = document.getElementById('ai-hint');
            const originalText = hintBtn.innerHTML;
            hintBtn.innerHTML = '⏳ Thinking...';
            hintBtn.disabled = true;

            const response = await fetch('/ai-hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    level: this.currentLevel,
                    description: level ? level.description : '',
                    currentCode: code || ''
                })
            });
            
            hintBtn.innerHTML = originalText;
            hintBtn.disabled = false;

            if (!response.ok) {
                const text = await response.text();
                const fallback = level && level.hint ? level.hint : 'No hint available.';
                this.showModal('Hint', `Server Error (${response.status}):\n${text.substring(0, 200)}\n\nFallback hint:\n${fallback}`);
                return;
            }

            const result = await response.json();

            if (result.success && result.hint) {
                this.showModal('AI Hint', result.hint);
            } else {
                const fallback = level && level.hint ? level.hint : 'No hint available.';
                this.showModal('Hint', result.message || result.error || fallback);
            }
        } catch (error) {
            const hintBtn = document.getElementById('ai-hint');
            if(hintBtn){ hintBtn.innerHTML = '💡 Hint'; hintBtn.disabled = false; }
            
            const fallback = level && level.hint ? level.hint : 'No hint available.';
            this.showModal('Hint', `Connection Error:\n${error.message}\n\nFallback hint:\n${fallback}`);
        }
    }

    async aiAnalyzeCode() {
        const code = document.getElementById('code-editor').value;
        const level = this.levels.find(l => l.id === this.currentLevel);

        if (!code.trim()) {
            this.showModal('AI Review', 'Please write some code before requesting an AI review.');
            return;
        }

        if (!this.aiEnabled) {
            this.showModal('AI Review', 'AI Review is not enabled. Configure your OpenAI API key to use this feature.');
            return;
        }

        try {
            const reviewBtn = document.getElementById('ai-review');
            const originalText = reviewBtn.innerHTML;
            reviewBtn.innerHTML = '⏳ Analyzing...';
            reviewBtn.disabled = true;

            const response = await fetch('/ai-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    code: code,
                    level: this.currentLevel,
                    description: level ? level.description : '',
                    expectedOutput: level ? level.expectedOutput : ''
                })
            });
            
            reviewBtn.innerHTML = originalText;
            reviewBtn.disabled = false;

            if (!response.ok) {
                const text = await response.text();
                this.showModal('AI Review', `Server Error (${response.status}):\n${text.substring(0, 200)}`);
                return;
            }

            const result = await response.json();

            if (result.success && result.analysis) {
                this.showModal('AI Code Review', result.analysis);
            } else {
                this.showModal('AI Review', result.message || result.error || 'AI review is currently unavailable.');
            }
        } catch (error) {
            const reviewBtn = document.getElementById('ai-review');
            if(reviewBtn){ reviewBtn.innerHTML = '🤖 AI Review'; reviewBtn.disabled = false; }
            this.showModal('AI Review', `Connection Error:\n${error.message}`);
        }
    }

    async completeLevel(levelId) {
        if (!this.completedLevels.includes(levelId)) {
            this.completedLevels.push(levelId);
            await this.saveProgress();
        }
        
        const level = this.levels.find(l => l.id === levelId);
        document.getElementById('medal-display').innerHTML = `
            <div class="medal medal-large" aria-label="Completion badge">${level.medal}</div>
            <div class="mt-2 text-warning fw-bold">Golden Badge Unlocked</div>
        `;
        document.getElementById('success-message').textContent = 
            `Congratulations! You've completed ${level.title}!`;
        
        // Use getOrCreateInstance instead of instantiating new modals, to prevent overlapping backdrops getting stuck
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('successModal'));
        modal.show();
        
        this.updateProgress();
        this.renderLevelCards();
    }

    nextLevel() {
        if (this.currentLevel < this.levels.length) {
            this.selectLevel(this.currentLevel + 1);
        } else {
            this.showLevelSelection();
        }
    }

    async sendAIChatMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        const chatMessages = document.getElementById('ai-chat-messages');
        
        if (!message) return;
        
        if (!this.aiEnabled) {
            this.addChatMessage('system', 'AI Chat is not enabled. Please configure OpenAI API key in config.env');
            return;
        }
        
        // Add user message
        this.addChatMessage('user', message);
        input.value = '';
        
        // Show typing indicator
        const typingId = this.addChatMessage('ai', 'Thinking...', true);
        
        try {
            const code = document.getElementById('code-editor').value;
            const level = this.levels.find(l => l.id === this.currentLevel);
            
            const response = await fetch('/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message: message,
                    code: code || '',
                    level: this.currentLevel,
                    context: level ? `${level.title}: ${level.task}` : ''
                })
            });
            
            const result = await response.json();
            
            // Remove typing indicator
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();
            
            if (result.success && result.response) {
                // Strip any markdown code blocks that AI might have included
                let cleanedResponse = result.response.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
                this.addChatMessage('ai', cleanedResponse);
            } else {
                this.addChatMessage('system', `Error: ${result.error || 'Failed to get AI response'}`);
            }
        } catch (error) {
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();
            this.addChatMessage('system', `Error: ${error.message}`);
        }
    }
    
    addChatMessage(role, message, isTyping = false) {
        const chatMessages = document.getElementById('ai-chat-messages');
        const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const messageDiv = document.createElement('div');
        messageDiv.id = messageId;
        messageDiv.className = `mb-2 ${role === 'user' ? 'text-end' : ''}`;
        
        if (role === 'user') {
            messageDiv.innerHTML = `
                <div class="d-inline-block bg-primary text-white p-2 rounded" style="max-width: 80%;">
                    <small>${this.escapeHtml(message)}</small>
                </div>
            `;
        } else if (role === 'ai') {
            messageDiv.innerHTML = `
                <div class="d-inline-block bg-light p-2 rounded border" style="max-width: 80%; text-align: left;">
                    <small class="text-muted">🤖 AI:</small>
                    <div class="mt-1">${isTyping ? '<em>' + this.escapeHtml(message) + '</em>' : this.formatMessage(message)}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="alert alert-warning py-2 mb-0">
                    <small>${this.escapeHtml(message)}</small>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageId;
    }
    
    formatMessage(text) {
        // Strip markdown code blocks that AI might include (remove ```python ... ```)
        text = text.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
        
        // Convert markdown-like formatting to HTML
        return this.escapeHtml(text)
            .replace(/\n/g, '<br>')
            .replace(/`([^`]+)`/g, '<code class="bg-light px-1 rounded">$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async generateNewAIQuestion() {
        const level = this.levels.find(l => l.id === this.currentLevel);
        const output = document.getElementById('terminal-output');
        const chatMessages = document.getElementById('ai-chat-messages');
        
        if (!this.aiEnabled) {
            this.addChatMessage('system', 'AI features are not enabled. Configure OpenAI API key to use this feature.');
            return;
        }
        
        // Show in both terminal and chat
        output.value = '>>> 🤖 Generating new AI question variation...\n';
        this.addChatMessage('system', '🤖 Generating a new question variation for you...');
        
        try {
            const response = await fetch('/ai-generate-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    level: this.currentLevel,
                    baseTask: level.task,
                    concept: level.description
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.task) {
                // Update level with AI-generated question
                level.task = result.task;
                level.expectedOutput = result.expectedOutput;
                level.hint = result.hint || level.hint;
                level.starterCode = result.starterCode || level.starterCode;
                
                // Update UI
                document.getElementById('level-description').innerHTML = `
                    <h6>${level.emoji} ${result.task}</h6>
                    <p>${level.description}</p>
                `;
                document.getElementById('expected-output').textContent = result.expectedOutput;
                document.getElementById('code-editor').value = result.starterCode;
                document.getElementById('terminal-output').value = '';
                
                // Check for input() calls in new code
                this.checkForInputCalls();
                
                // Show success message
                output.value = '>>> ✅ New AI-generated question loaded!\n';
                this.addChatMessage('ai', `✅ New question generated!\n\n**New Task:** ${result.task}\n\n**Expected Output:**\n\`\`\`\n${result.expectedOutput}\n\`\`\`\n\nThe question has been updated in the editor. Good luck!`);
                
                // Store AI-generated expected output for validation
                level.aiGeneratedExpectedOutput = result.expectedOutput;
            } else {
                const errorMsg = result.error || 'AI question generation unavailable';
                output.value += `>>> ${errorMsg}\n`;
                this.addChatMessage('system', `❌ ${errorMsg}`);
            }
        } catch (error) {
            const errorMsg = `Error: ${error.message}`;
            output.value += `>>> ${errorMsg}\n`;
            this.addChatMessage('system', `❌ ${errorMsg}`);
        }
    }
    
    showModal(title, content) {
        const modalHtml = `
            <div class="modal fade" id="dynamicModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p style="white-space: pre-wrap;">${content}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('dynamicModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('dynamicModal'));
        modal.show();
        
        // Clean up after hiding
        document.getElementById('dynamicModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    updateProgress() {
        const completed = this.completedLevels.length;
        const total = this.levels.length;
        const percentage = (completed / total) * 100;
        
        document.getElementById('progress-text').textContent = `${completed}/${total}`;
        
        const circle = document.getElementById('progress-circle');
        const circumference = 2 * Math.PI * 25;
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
}

// Initialize the app
const app = new PythonLearningPlatform();
