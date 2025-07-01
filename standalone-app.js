#!/usr/bin/env node

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

// Embedded minimal server for the AI Tutor
class AITutorStandalone {
    constructor() {
        this.app = express();
        this.port = 3000;
        this.setupServer();
    }

    setupServer() {
        // Serve static files from dist directory (built web app)
        this.app.use(express.static(path.join(__dirname, 'dist')));
        this.app.use(express.json());

        // Basic API endpoints for the standalone version
        this.app.get('/api/health', (req, res) => {
            res.json({ status: 'ok', mode: 'standalone' });
        });

        // Serve the main app for all routes
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        });
    }

    async start() {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, '127.0.0.1', () => {
                console.log(`AI Tutor running at http://localhost:${this.port}`);
                resolve();
            });
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
        }
    }
}

// Main execution
async function main() {
    console.log('Starting AI Tutor Standalone Application...');
    
    // Check if dist directory exists
    if (!fs.existsSync(path.join(__dirname, 'dist'))) {
        console.error('Error: dist directory not found. Please run "npm run build" first.');
        process.exit(1);
    }

    const aiTutor = new AITutorStandalone();
    
    try {
        await aiTutor.start();
        
        // Open browser automatically
        const url = `http://localhost:${aiTutor.port}`;
        console.log(`Opening AI Tutor at ${url}`);
        
        // Cross-platform browser opening
        const command = process.platform === 'win32' ? 'start' : 
                       process.platform === 'darwin' ? 'open' : 'xdg-open';
        
        spawn(command, [url], { detached: true, stdio: 'ignore' });
        
        console.log('AI Tutor is now running! Close this window to stop the application.');
        
        // Keep the process running
        process.on('SIGINT', () => {
            console.log('\nShutting down AI Tutor...');
            aiTutor.stop();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Failed to start AI Tutor:', error);
        process.exit(1);
    }
}

// Self-executing
if (require.main === module) {
    main();
}

module.exports = { AITutorStandalone };