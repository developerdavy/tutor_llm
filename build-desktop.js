#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building AI Tutor Desktop Application...\n');

// Step 1: Build the web application
console.log('📦 Building web application...');
const buildWeb = spawn('npm', ['run', 'build'], { stdio: 'inherit' });

buildWeb.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Web build failed');
    process.exit(1);
  }
  
  console.log('✅ Web build completed\n');
  
  // Step 2: Create assets directory if it doesn't exist
  if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets');
    console.log('📁 Created assets directory');
  }
  
  // Step 3: Build electron app
  console.log('🖥️  Building desktop application...');
  const buildElectron = spawn('npx', ['electron-builder', '--config', 'electron-package.json'], { stdio: 'inherit' });
  
  buildElectron.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Desktop build failed');
      process.exit(1);
    }
    
    console.log('\n🎉 Desktop application built successfully!');
    console.log('📁 Check the electron-dist folder for your executable');
    
    // List built files
    const distPath = path.join(__dirname, 'electron-dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      console.log('\n📋 Built files:');
      files.forEach(file => {
        console.log(`   - ${file}`);
      });
    }
  });
});