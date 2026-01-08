import { spawn } from 'child_process';

// Unset the problematic environment variable
delete process.env.ELECTRON_RUN_AS_NODE;

// Start concurrently
// Using quotes carefully for Windows
const devProcess = spawn('npx', [
    'concurrently',
    '-n', 'Vite,WhatsApp,Electron,GitSync',
    '-c', 'blue,magenta,green,yellow',
    '"npx vite"',
    '"node src/main/whatsappServer.cjs"',
    '"npx wait-on http://localhost:4500 && npx electron ."',
    '"node git-sync.cjs"'
], {
    stdio: 'inherit',
    shell: true,
    env: process.env
});

devProcess.on('exit', (code) => {
    process.exit(code);
});
