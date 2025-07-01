#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Standalone Application Setup...\n');

// Check if all required files exist
const requiredFiles = [
    'standalone-app.js',
    'build-exe.js'
];

const optionalFiles = [
    'dist/index.html',
    'dist/assets'
];

console.log('📁 Checking required files...');
let allGood = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - Found`);
    } else {
        console.log(`❌ ${file} - Missing`);
        allGood = false;
    }
});

console.log('\n📁 Checking build files...');
optionalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - Found`);
    } else {
        console.log(`⚠️  ${file} - Not found (run 'npm run build' first)`);
    }
});

if (allGood) {
    console.log('\n🎉 Setup looks good!');
    console.log('\n📋 Next steps:');
    
    if (!fs.existsSync('dist/index.html')) {
        console.log('1. Run: npm run build');
        console.log('2. Run: node build-exe.js');
    } else {
        console.log('1. Run: node build-exe.js');
    }
    
    console.log('\n💡 This will create:');
    console.log('   - build/ai-tutor.exe (standalone executable)');
    console.log('   - build/dist/ (web app files)');
    console.log('   - build/Launch AI Tutor.bat (easy launcher)');
    
    console.log('\n🚀 Users can then:');
    console.log('   - Double-click "Launch AI Tutor.bat"');
    console.log('   - Or run "ai-tutor.exe" directly');
    console.log('   - App opens in their browser automatically');
    
} else {
    console.log('\n❌ Some required files are missing.');
    console.log('Please ensure all setup files are in place.');
}

console.log('\n📖 Features of the standalone .exe:');
console.log('   ✅ No Node.js installation required');
console.log('   ✅ Single file distribution');
console.log('   ✅ Includes web server');
console.log('   ✅ Opens browser automatically');
console.log('   ✅ Works offline');
console.log('   ✅ Professional deployment option');