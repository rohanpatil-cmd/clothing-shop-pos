console.log('--- ENV CHECK ---');
console.log('Process versions:', process.versions);
console.log('Is electron version present?', !!process.versions.electron);
const electron = require('electron');
console.log('Type of electron:', typeof electron);
console.log('Value of electron:', electron);
try {
    const { app } = require('electron');
    console.log('App exists?', !!app);
} catch (e) {
    console.log('Error requiring app:', e.message);
}
console.log('--- ENV CHECK END ---');
process.exit(0);
