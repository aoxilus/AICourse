// Quick setup verification script
const fs = require('fs');
const { spawn } = require('child_process');

console.log('🔍 Verifying Python Learning Platform Setup...\n');

// Check 1: Node.js version
console.log('1. Checking Node.js...');
const nodeVersion = process.version;
console.log(`   ✅ Node.js ${nodeVersion} detected`);

// Check 2: Python availability
console.log('\n2. Checking Python...');
function checkPython() {
    return new Promise((resolve) => {
        const python = process.platform === 'win32' ? 'python' : 'python3';
        const proc = spawn(python, ['--version']);
        let output = '';
        
        proc.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        proc.stderr.on('data', (data) => {
            output += data.toString();
        });
        
        proc.on('close', (code) => {
            if (code === 0) {
                console.log(`   ✅ ${output.trim()}`);
                resolve(true);
            } else {
                console.log(`   ⚠️  Python not found. Install from: https://www.python.org/downloads/`);
                resolve(false);
            }
        });
        
        proc.on('error', () => {
            console.log(`   ⚠️  Python not found. Install from: https://www.python.org/downloads/`);
            resolve(false);
        });
    });
}

// Check 3: Node modules
console.log('\n3. Checking Node.js dependencies...');
if (fs.existsSync('node_modules')) {
    console.log('   ✅ node_modules directory found');
    
    // Check key dependencies
    const deps = ['express', 'cors', 'dotenv', 'openai'];
    const missing = [];
    deps.forEach(dep => {
        if (!fs.existsSync(`node_modules/${dep}`)) {
            missing.push(dep);
        }
    });
    
    if (missing.length === 0) {
        console.log('   ✅ All required dependencies installed');
    } else {
        console.log(`   ⚠️  Missing: ${missing.join(', ')}`);
        console.log('   Run: npm install');
    }
} else {
    console.log('   ⚠️  node_modules not found');
    console.log('   Run: npm install');
}

// Check 4: Config file
console.log('\n4. Checking configuration...');
if (fs.existsSync('config.env')) {
    const config = fs.readFileSync('config.env', 'utf8');
    if (config.includes('sk-your-key-here')) {
        console.log('   ⚠️  OpenAI API key not configured (optional)');
        console.log('   Add your key to config.env for AI features');
    } else if (config.includes('OPENAI_API_KEY=sk-')) {
        console.log('   ✅ OpenAI API key configured');
    } else {
        console.log('   ℹ️  config.env exists');
    }
} else {
    console.log('   ⚠️  config.env not found (optional for AI features)');
}

// Check 5: Python dependencies
console.log('\n5. Checking Python dependencies...');
if (fs.existsSync('requirements.txt')) {
    const req = fs.readFileSync('requirements.txt', 'utf8');
    if (req.includes('ZERO EXTERNAL DEPENDENCIES')) {
        console.log('   ✅ Zero external Python packages required!');
        console.log('   ✅ Uses only Python standard library');
    }
} else {
    console.log('   ℹ️  requirements.txt not found');
}

// Check 6: Core files
console.log('\n6. Checking core files...');
const coreFiles = ['server.js', 'index.html', 'script.js', 'package.json'];
let allPresent = true;
coreFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} missing!`);
        allPresent = false;
    }
});

// Final summary
console.log('\n' + '='.repeat(50));
console.log('📊 Setup Summary');
console.log('='.repeat(50));

checkPython().then(pythonOk => {
    if (pythonOk && allPresent) {
        console.log('\n✅ Setup looks good! You can start the server with:');
        console.log('   npm start');
        console.log('\n   Then open: http://localhost:3000');
    } else {
        console.log('\n⚠️  Some issues detected. Please fix them before starting.');
    }
    console.log('\n📝 Note: Python uses ZERO external packages - standard library only!');
});



