const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'shop.db');
const db = new Database(dbPath, { verbose: console.log });

try {
    const resetSales = db.transaction(() => {
        console.log('Deleting invoice items...');
        db.prepare('DELETE FROM invoice_items').run();
        console.log('Deleting invoices...');
        db.prepare('DELETE FROM invoices').run();
        console.log('Sales reset successfully.');
    });

    resetSales();
} catch (error) {
    console.error('Failed to reset sales:', error);
} finally {
    db.close();
}
