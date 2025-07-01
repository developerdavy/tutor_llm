# AI Tutor Desktop Application Guide

## Overview
Your AI Tutor web application can now be packaged as a Windows executable using Electron. This allows users to run it as a native desktop application.

## Quick Start

### Option 1: Run Development Desktop App
```bash
node run-desktop.js
```
This will:
- Start your backend server
- Launch the desktop app automatically
- Connect to localhost:5000

### Option 2: Build Windows Executable
```bash
node build-desktop.js
```
This creates a complete Windows installer/executable in the `electron-dist` folder.

## What's Included

### Files Created:
- **electron-main.js** - Main Electron application entry point
- **run-desktop.js** - Development launcher script
- **build-desktop.js** - Production build script
- **electron-package.json** - Electron-specific configuration

### Desktop App Features:
✅ **Native Window** - Runs in its own window like any desktop app
✅ **Menu Bar** - Standard application menu
✅ **Taskbar Integration** - Shows in Windows taskbar
✅ **Auto-Updates** - Can be configured for automatic updates
✅ **Offline Capable** - Works without browser dependencies
✅ **Security** - Isolated from browser security issues

## How It Works

1. **Development Mode**: 
   - Electron loads your web app from localhost:5000
   - All your existing functionality works exactly the same
   - Hot reload and development tools available

2. **Production Mode**:
   - Builds your web app into static files
   - Packages everything into a single executable
   - No external dependencies needed

## Building for Distribution

### Prerequisites:
- Windows: No additional requirements
- macOS: Requires macOS to build .dmg files
- Linux: Can build AppImage on any platform

### Build Commands:
```bash
# Build for current platform
node build-desktop.js

# Or manually with electron-builder
npx electron-builder --config electron-package.json
```

### Output Files:
- **Windows**: `.exe` installer and portable `.exe`
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` portable app

## Customization Options

### App Icon:
Place your icon files in the `assets/` folder:
- `icon.ico` - Windows icon
- `icon.icns` - macOS icon  
- `icon.png` - Linux icon

### App Details:
Edit `electron-package.json` to change:
- App name and description
- Version number
- Author information
- Build settings

### Window Settings:
Modify `electron-main.js` to adjust:
- Window size and position
- Menu options
- Security settings
- Loading behavior

## Advantages of Desktop App

**For Users:**
- No browser required
- Faster startup
- Native OS integration
- Desktop shortcuts
- Works offline (after initial setup)

**For You:**
- Same codebase as web app
- Easy distribution
- Professional appearance
- Can add desktop-specific features

## Deployment Options

### Self-Hosted:
- Users download and install the .exe file
- App connects to your deployed backend
- Full control over distribution

### Microsoft Store:
- Package as MSIX for Store distribution
- Automatic updates through Store
- Wider reach to users

### Enterprise:
- Silent install options
- Group policy deployment
- Custom branding

## Next Steps

1. **Test the development app**: Run `node run-desktop.js`
2. **Customize the appearance**: Add your app icon to `assets/`
3. **Build the executable**: Run `node build-desktop.js`
4. **Test the built app**: Install and run the generated .exe
5. **Deploy**: Distribute the installer to users

The desktop app will work with both your local WordPress setup and your deployed backend server, giving users the full AI Tutor experience in a native desktop environment.