const { execSync } = require('child_process');

const GIT_EXE = '"C:\\Program Files\\Git\\cmd\\git.exe"';

function sync() {
    try {
        console.log('[Git Sync] Checking for changes...');

        // Add all changes
        execSync(`${GIT_EXE} add .`);

        // Check if there are changes to commit
        const status = execSync(`${GIT_EXE} status --porcelain`).toString();

        if (status) {
            console.log('[Git Sync] Changes detected. Committing and pushing...');
            const timestamp = new Date().toLocaleString();
            execSync(`${GIT_EXE} commit -m "Auto-sync: ${timestamp}"`);
            execSync(`${GIT_EXE} push origin main`);
            console.log('[Git Sync] Successfully synced to GitHub! ✨');
        } else {
            console.log('[Git Sync] No changes to sync.');
        }
    } catch (error) {
        console.error('[Git Sync] Failed to sync:', error.message);
    }
}

// Run immediately on start
sync();

// Then run every 5 minutes
setInterval(sync, 5 * 60 * 1000);
