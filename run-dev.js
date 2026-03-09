import { spawn } from 'child_process';

// Start concurrently
// Using quotes carefully for Windows
const devProcess = spawn('npx', [
    'concurrently',
    '-n', 'Vite,API,GitSync',
    '-c', 'blue,magenta,yellow',
    '"npx vite"',
    '"node src/main/server.cjs"',
    '"node git-sync.cjs"'
], {
    stdio: 'inherit',
    shell: true,
    env: process.env
});

devProcess.on('exit', (code) => {
    process.exit(code);
});
