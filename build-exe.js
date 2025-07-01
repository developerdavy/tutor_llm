#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building AI Tutor Standalone Executable...\n');

async function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, { 
            stdio: 'inherit',
            shell: true,
            ...options 
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}

async function buildExecutable() {
    try {
        // Step 1: Build the web application
        console.log('📦 Building web application...');
        await runCommand('npm', ['run', 'build']);
        console.log('✅ Web build completed\n');

        // Step 2: Create package.json for pkg
        console.log('📄 Creating package configuration...');
        const pkgConfig = {
            name: "ai-tutor-standalone",
            version: "1.0.0",
            main: "standalone-app.js",
            bin: "standalone-app.js",
            pkg: {
                scripts: ["standalone-app.js"],
                assets: ["dist/**/*"],
                targets: ["node18-win-x64"],
                outputPath: "build"
            }
        };

        fs.writeFileSync('pkg-config.json', JSON.stringify(pkgConfig, null, 2));
        console.log('✅ Package configuration created\n');

        // Step 3: Build executable with pkg
        console.log('🔧 Building Windows executable...');
        
        // Ensure build directory exists
        if (!fs.existsSync('build')) {
            fs.mkdirSync('build');
        }

        await runCommand('npx', [
            'pkg',
            'standalone-app.js',
            '--targets', 'node18-win-x64',
            '--output', 'build/ai-tutor.exe',
            '--compress', 'GZip'
        ]);

        console.log('✅ Executable built successfully!\n');

        // Step 4: Copy dist folder to build directory
        console.log('📁 Copying application files...');
        if (fs.existsSync('build/dist')) {
            fs.rmSync('build/dist', { recursive: true, force: true });
        }
        
        // Copy dist folder
        fs.cpSync('dist', 'build/dist', { recursive: true });
        console.log('✅ Application files copied\n');

        // Step 5: Create launcher script
        const launcherScript = `@echo off
echo Starting AI Tutor...
start "" "%~dp0ai-tutor.exe"
echo AI Tutor is starting in your browser...
pause`;

        fs.writeFileSync('build/Launch AI Tutor.bat', launcherScript);
        console.log('✅ Launcher script created\n');

        // Success message
        console.log('🎉 BUILD COMPLETE!');
        console.log('📁 Files created in build/ folder:');
        console.log('   - ai-tutor.exe (Main executable)');
        console.log('   - dist/ (Web application files)');
        console.log('   - Launch AI Tutor.bat (Easy launcher)');
        console.log('\n💡 To distribute:');
        console.log('   1. Copy the entire build/ folder');
        console.log('   2. Users can run "Launch AI Tutor.bat" or "ai-tutor.exe"');
        console.log('   3. The app will open in their default browser');

    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Check if required files exist
if (!fs.existsSync('standalone-app.js')) {
    console.error('❌ standalone-app.js not found');
    process.exit(1);
}

buildExecutable();