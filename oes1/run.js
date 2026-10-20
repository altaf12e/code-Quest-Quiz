const { spawn } = require('child_process');
const path = require('path');

console.log('\n=========================================');
console.log('    ⚔️ Starting CodeQuest Platform ⚔️   ');
console.log('=========================================\n');

const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

// 1. Start Backend Server on Port 5000
console.log('🚀 [1/3] Starting Backend Server (Port 5000)...');
const backend = spawn('node', ['server.js'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true
});

backend.on('error', (err) => {
    console.error('❌ Failed to start Backend Server:', err);
});

// 2. Start Frontend Server on Port 5500
console.log('🌐 [2/3] Starting Frontend Server (Port 5500)...');
const frontend = spawn('python', ['-m', 'http.server', '5500'], {
    cwd: clientDir,
    stdio: 'inherit',
    shell: true
});

frontend.on('error', (err) => {
    console.error('❌ Failed to start Frontend Server with Python. Trying npx serve...', err);
    spawn('npx', ['serve', '-l', '5500'], {
        cwd: clientDir,
        stdio: 'inherit',
        shell: true
    });
});

// 3. Open Browser after 2.5 seconds
setTimeout(() => {
    console.log('💻 [3/3] Opening http://localhost:5500 in your browser...\n');
    console.log('=========================================');
    console.log('  🎉 CodeQuest is LIVE & READY!');
    console.log('  - Frontend: http://localhost:5500');
    console.log('  - Backend:  http://localhost:5000');
    console.log('  - Admin:    admin / admin123');
    console.log('  - Press Ctrl + C to stop both servers');
    console.log('=========================================\n');

    const openCmd = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    spawn(openCmd, ['http://localhost:5500'], { shell: true });
}, 2500);

// Graceful cleanup on Ctrl + C
function cleanup() {
    console.log('\n🛑 Stopping CodeQuest servers...');
    try { backend.kill(); } catch (e) {}
    try { frontend.kill(); } catch (e) {}
    process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

