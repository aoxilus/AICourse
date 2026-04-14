const tests = [
    {
        name: "Level 1: Print Master",
        level: 1,
        code: `print("Hello, Python World!")`
    },
    {
        name: "Level 3: Loop Explorer",
        level: 3,
        code: `for i in range(1, 11):\n    print(i)`
    },
    {
        name: "Level 5: Function Creator",
        level: 5,
        code: `def calculate_area(width, height):\n    return width * height\n\nprint(f"The area is: {calculate_area(5, 3)}")`
    },
    {
        name: "Level 8: Error Guardian",
        level: 8,
        code: `num1 = input("Enter first number: ")\nnum2 = input("Enter second number: ")\ntry:\n    print(int(num1) / int(num2))\nexcept ZeroDivisionError:\n    print("Error: Cannot divide by zero!")`
    }
];

async function runTests() {
    console.log("🚀 Starting Backend Validation Tests\\n");
    let passedTests = 0;

    for (let test of tests) {
        console.log(`Testing [${test.name}]...`);
        try {
            const result = await fetch('http://localhost:3000/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: test.code,
                    level: test.level,
                    submit: true,
                    userInput: (test.level === 8) ? "10\\n0\\n" : null
                })
            });
            const data = await result.json();

            if (data.success && data.passed) {
                console.log(`✅ PASS: ${test.name}`);
                passedTests++;
            } else {
                console.log(`❌ FAIL: ${test.name}`);
                console.log(`Reason: \${data.error || 'AI/Matcher failed it'}`);
                if (data.aiAnalysis) console.log(`AI Analysis: \${data.aiAnalysis}`);
                console.log(data);
            }
        } catch (e) {
            console.log(`❌ ERROR: Failed to run test \${test.name}. \${e.message}`);
        }
        console.log("-----------------------------------------");
    }

    console.log(`\\n🎉 Test Suite Completed! \${passedTests}/\${tests.length} tests passed.`);
}

runTests();
