#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting AI Tutor Desktop Application...\n');

// Function to check if server is running
function checkServer(callback) {
  const req = http.request({ host: 'localhost', port: 5000, path: '/' }, (res) => {
    callback(true);
  });
  
  req.on('error', () => {
    callback(false);
  });
  
  req.end();
}

// Start the backend server
console.log('🔧 Starting backend server...');
const server = spawn('npm', ['run', 'dev'], { 
  stdio: ['pipe', 'pipe', 'pipe'],
  detached: false
});

server.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('serving on port')) {
    console.log('✅ Backend server started\n');
    
    // Wait a moment then start Electron
    setTimeout(() => {
      console.log('🖥️  Launching desktop application...');
      const electron = spawn('npx', ['electron', '.'], { stdio: 'inherit' });
      
      electron.on('close', () => {
        console.log('\n👋 Desktop application closed');
        server.kill();
        process.exit(0);
      });
    }, 2000);
  }
  console.log(output.trim());
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});