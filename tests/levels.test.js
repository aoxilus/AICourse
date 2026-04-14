// Level Validation Tests
const { TestRunner, Assert } = require('./test-runner');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const runner = new TestRunner();

runner.describe('Level Solutions Tests', () => {
    
    runner.test('Level 1: Print Master - Basic printing', async () => {
        const code = 'print("Hello, Python World!")';
        const result = await executeCode(code);
        
        Assert.true(result.success, 'Code should execute successfully');
        Assert.equal(result.output.trim(), 'Hello, Python World!', 'Output should match exactly');
    });

    runner.test('Level 2: Number Detective - Input validation (>10)', async () => {
        const code = `user_input = input("Enter a number: ")
try:
    number = int(user_input)
    if number > 10:
        print("bigger than 10")
    else:
        print("less than 10")
except ValueError:
    print("hey this is not a number")`;
        
        const result = await executeCode(code, '15\n');
        
        Assert.true(result.success, 'Code should execute successfully');
        Assert.ok(result.output.includes('bigger than 10'), 'Should detect number > 10');
    });

    runner.test('Level 2: Number Detective - Invalid input', async () => {
        const code = `user_input = input("Enter a number: ")
try:
    number = int(user_input)
    if number > 10:
        print("bigger than 10")
    else:
        print("less than 10")
except ValueError:
    print("hey this is not a number")`;
        
        const result = await executeCode(code, 'hello\n');
        
        Assert.true(result.success, 'Code should execute successfully');
        Assert.ok(result.output.includes('hey this is not a number'), 'Should detect non-number');
    });

    runner.test('Level 3: Loop Explorer - For loop 1-10', async () => {
        const code = `for i in range(1, 11):
    print(i)`;
        
        const result = await executeCode(code);
        
        Assert.true(result.success, 'Code should execute successfully');
        const lines = result.output.trim().split(/\r?\n/).map(l => l.trim());
        Assert.equal(lines.length, 10, 'Should print 10 numbers');
        Assert.equal(lines[0], '1', 'Should start with 1');
        Assert.equal(lines[9], '10', 'Should end with 10');
    });

    runner.test('Level 4: List Builder - Lists with enumeration', async () => {
        const code = `foods = ["Apple", "Pizza", "Pasta", "Burger", "Ice Cream"]
for i, food in enumerate(foods, 1):
    print(f"{i}. {food}")`;
        
        const result = await executeCode(code);
        
        Assert.true(result.success, 'Code should execute successfully');
        Assert.ok(result.output.includes('1. Apple'), 'Should list first item');
        Assert.ok(result.output.includes('5. Ice Cream'), 'Should list last item');
    });

    runner.test('Level 5: Function Creator - Calculate area', async () => {
        const code = `def calculate_area(width, height):
    return width * height

area = calculate_area(5, 3)
print(f"The area is: {area}")`;
        
        const result = await executeCode(code);
        
        Assert.true(result.success, 'Code should execute successfully');
        Assert.equal(result.output.trim(), 'The area is: 15', 'Should calculate area correctly');
    });

    runner.test('Level 6: Dictionary Master - Student grades', async () => {
        const code = `students = {"Alice": 95, "Bob": 87, "Charlie": 92}
for name, grade in students.items():
    print(f"{name}: {grade}")`;
        
        const result = await executeCode(code);
        
        Assert.true(result.success, 'Code should execute successfully');
        Assert.ok(result.output.includes('Alice:'), 'Should include Alice');
        Assert.ok(result.output.includes('Bob:'), 'Should include Bob');
        Assert.ok(result.output.includes('Charlie:'), 'Should include Charlie');
    });

    runner.test('Level 9: Class Architect - Basic OOP', async () => {
        const code = `class Car:
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model
    
    def start_engine(self):
        print(f"{self.brand} {self.model} engine started!")

my_car = Car("Toyota", "Camry")
print(f"Car created: {my_car.brand} {my_car.model}")
my_car.start_engine()`;
        
        const result = await executeCode(code);
        
        Assert.true(result.success, 'Code should execute successfully');
        Assert.ok(result.output.includes('Car created: Toyota Camry'), 'Should create car');
        Assert.ok(result.output.includes('engine started'), 'Should start engine');
    });

    runner.test('Level 10: Data Analyzer - Statistics', async () => {
        const code = `numbers = [23, 45, 12, 67, 34, 89, 56]
print(f"Numbers: {numbers}")
print(f"Sum: {sum(numbers)}")
print(f"Average: {sum(numbers)/len(numbers):.2f}")
print(f"Max: {max(numbers)}")
print(f"Min: {min(numbers)}")`;
        
        const result = await executeCode(code);
        
        Assert.true(result.success, 'Code should execute successfully');
        Assert.ok(result.output.includes('Sum: 326'), 'Should calculate sum');
        Assert.ok(result.output.includes('Max: 89'), 'Should find max');
        Assert.ok(result.output.includes('Min: 12'), 'Should find min');
    });

    runner.test('Level 11: Module Master - Datetime import', async () => {
        const code = `from datetime import datetime
now = datetime.now()
formatted_time = now.strftime("%Y-%m-%d %H:%M:%S")
print(f"Today is: {formatted_time}")`;
        
        const result = await executeCode(code);
        
        Assert.true(result.success, 'Code should execute successfully');
        Assert.ok(result.output.includes('Today is:'), 'Should print formatted date');
    });
});

// Helper function to execute Python code
async function executeCode(code, input = '') {
    return new Promise((resolve) => {
        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const filename = path.join(tempDir, `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`);
        
        try {
            fs.writeFileSync(filename, code);

            let python;
            if (process.platform === 'win32') {
                // Match server.js: quote both the Python bootstrapper path and filename
                const pythonPath = path.join(__dirname, '..', 'python.cmd');
                const cmd = `"${pythonPath}" "${filename}"`;
                python = spawn(cmd, [], { shell: true });
            } else {
                python = spawn('python3', [filename], {});
            }
            let output = '';
            let error = '';
            
            const timeout = setTimeout(() => {
                python.kill('SIGKILL');
                resolve({ success: false, output: '', error: 'Timeout' });
            }, 5000);
            
            if (input) {
                python.stdin.write(input);
                python.stdin.end();
            }
            
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            python.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            python.on('close', (code) => {
                clearTimeout(timeout);
                
                // Clean up
                if (fs.existsSync(filename)) {
                    fs.unlinkSync(filename);
                }
                
                if (code === 0) {
                    resolve({ success: true, output: output, error: '' });
                } else {
                    resolve({ success: false, output: '', error: error });
                }
            });
            
            python.on('error', (err) => {
                clearTimeout(timeout);
                if (fs.existsSync(filename)) {
                    fs.unlinkSync(filename);
                }
                resolve({ success: false, output: '', error: err.message });
            });
        } catch (error) {
            if (fs.existsSync(filename)) {
                fs.unlinkSync(filename);
            }
            resolve({ success: false, output: '', error: error.message });
        }
    });
}

// Run tests if called directly
if (require.main === module) {
    runner.run();
}

module.exports = runner;
