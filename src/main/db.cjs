const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

const isDev = !app.isPackaged;

const dbPath = isDev
  ? path.join(__dirname, '../../shop.db')
  : path.join(app.getPath('userData'), 'shop.db');

let db;

function getDb() {
  if (!db) {
    try {
      db = new Database(dbPath, { verbose: console.log });
      db.pragma('journal_mode = WAL');
      initDb();
    } catch (error) {
      console.error('Failed to open database:', error);
      throw error;
    }
  }
  return db;
}

function initDb() {
  if (!db) return;
  const db_instance = db;

  // Create tables using surrogate ID for customers
  db_instance.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mobile TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      size TEXT,
      color TEXT,
      stock_qty INTEGER DEFAULT 0,
      cost_price REAL,
      selling_price REAL,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      total_amount REAL,
      tax_amount REAL,
      discount_amount REAL DEFAULT 0,
      payment_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER,
      product_id INTEGER,
      qty INTEGER,
      price REAL,
      FOREIGN KEY(invoice_id) REFERENCES invoices(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('manager', 'user')) NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      supplier_name TEXT NOT NULL,
      purchase_price REAL NOT NULL,
      qty INTEGER NOT NULL,
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // --- MIGRATIONS ---

  // Migration: If the old customers table exists (mobile as PRIMARY KEY), we need to migrate it.
  // SQLite doesn't let us easily drop PRIMARY KEY, so we check if 'id' exists.
  try {
    db_instance.prepare('SELECT id FROM customers LIMIT 1').get();
  } catch (e) {
    console.log('Migrating customers table to ID-based primary key...');
    db_instance.exec(`
      ALTER TABLE customers RENAME TO customers_old;
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mobile TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO customers (mobile, name, email, created_at) 
      SELECT mobile, name, email, created_at FROM customers_old;
    `);
  }

  // Migration: Update invoices to use customer_id instead of customer_mobile
  try {
    db_instance.prepare('SELECT customer_id FROM invoices LIMIT 1').get();
  } catch (e) {
    console.log('Adding customer_id to invoices and migrating data...');
    db_instance.exec(`
      ALTER TABLE invoices ADD COLUMN customer_id INTEGER;
      UPDATE invoices SET customer_id = (
        SELECT id FROM customers WHERE mobile = invoices.customer_mobile LIMIT 1
      );
    `);
  }

  // Migration: Add discount_amount column if not exists
  try {
    db_instance.prepare('SELECT discount_amount FROM invoices LIMIT 1').get();
  } catch (e) {
    db_instance.exec('ALTER TABLE invoices ADD COLUMN discount_amount REAL DEFAULT 0');
    console.log('Added discount_amount column to invoices table');
  }

  // Migration: Add image column if not exists
  try {
    db_instance.prepare('SELECT image FROM products LIMIT 1').get();
  } catch (e) {
    db_instance.exec('ALTER TABLE products ADD COLUMN image TEXT');
    console.log('Added image column to products table');
  }

  // Seed default users if table is empty
  const usersCount = db_instance.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (usersCount === 0) {
    db_instance.prepare('INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)').run('admin', 'admin123', 'manager', 'Store Manager');
    db_instance.prepare('INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)').run('user', 'user123', 'user', 'Sales Staff');
    console.log('Seeded default users: admin/admin123 and user/user123');
  }

  // Seed default settings if empty
  const settingsCount = db_instance.prepare('SELECT COUNT(*) as count FROM settings').get().count;
  if (settingsCount === 0) {
    const defaultSettings = [
      { key: 'store_name', value: 'LUXURY CLOTHING' },
      { key: 'store_address', value: '123 Luxury Avenue, Fashion District, Mumbai' },
      { key: 'store_contact', value: '+91 98765 43210' },
      { key: 'whatsapp_token', value: '' },
      { key: 'whatsapp_phone_id', value: '' },
      { key: 'currency_symbol', value: '₹' }
    ];
    const insert = db_instance.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    defaultSettings.forEach(s => insert.run(s.key, s.value));
    console.log('Seeded default settings');
  }
}

// Data Access Methods
const queries = {
  // Auth
  login: (username, password) => {
    return getDb().prepare('SELECT username, role, name FROM users WHERE username=? AND password=?').get(username, password);
  },

  // Products
  getProducts: () => getDb().prepare('SELECT * FROM products ORDER BY created_at DESC').all(),
  addProduct: (p) => getDb().prepare('INSERT INTO products (name, category, size, color, stock_qty, cost_price, selling_price, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(p.name, p.category, p.size, p.color, p.stock_qty, p.cost_price, p.selling_price, p.image),
  updateProduct: (id, p) => getDb().prepare('UPDATE products SET name=?, category=?, size=?, color=?, stock_qty=?, cost_price=?, selling_price=?, image=? WHERE id=?').run(p.name, p.category, p.size, p.color, p.stock_qty, p.cost_price, p.selling_price, p.image, id),
  deleteProduct: (id) => getDb().prepare('DELETE FROM products WHERE id=?').run(id),

  // Customers
  getCustomers: () => getDb().prepare(`
    SELECT c.*, COUNT(i.id) as order_count 
    FROM customers c 
    LEFT JOIN invoices i ON c.id = i.customer_id 
    GROUP BY c.id 
    ORDER BY order_count DESC, c.name ASC
  `).all(),
  getCustomer: (mobile) => getDb().prepare('SELECT * FROM customers WHERE mobile=? ORDER BY created_at DESC LIMIT 1').get(mobile),
  addCustomer: (c) => getDb().prepare('INSERT INTO customers (mobile, name, email) VALUES (?, ?, ?)').run(c.mobile, c.name, c.email),

  // Invoices
  createInvoice: (data) => {
    const database = getDb();
    const transaction = database.transaction((invoice) => {
      const { customer, items, total_amount, tax_amount, discount_amount, payment_method } = invoice;

      // 1. Ensure customer exists - match by BOTH mobile and name
      let customerRecord = database.prepare('SELECT id FROM customers WHERE mobile = ? AND name = ?').get(customer.mobile, customer.name);

      let customerId;
      if (customerRecord) {
        customerId = customerRecord.id;
      } else {
        const info = database.prepare('INSERT INTO customers (mobile, name) VALUES (?, ?)').run(customer.mobile, customer.name);
        customerId = info.lastInsertRowid;
      }

      // 2. Insert invoice
      const info = database.prepare('INSERT INTO invoices (customer_id, total_amount, tax_amount, discount_amount, payment_method) VALUES (?, ?, ?, ?, ?)').run(customerId, total_amount, tax_amount, discount_amount || 0, payment_method);
      const invoiceId = info.lastInsertRowid;

      // 3. Insert items and update stock
      const insertItem = database.prepare('INSERT INTO invoice_items (invoice_id, product_id, qty, price) VALUES (?, ?, ?, ?)');
      const updateStock = database.prepare('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?');

      for (const item of items) {
        insertItem.run(invoiceId, item.product_id, item.qty, item.price);
        updateStock.run(item.qty, item.product_id);
      }

      return invoiceId;
    });
    return transaction(data);
  },
  getInvoices: () => getDb().prepare('SELECT i.*, c.name as customer_name, c.mobile as customer_mobile FROM invoices i JOIN customers c ON i.customer_id = c.id ORDER BY i.created_at DESC').all(),
  getCustomerInvoices: (mobile) => {
    return getDb().prepare('SELECT i.*, c.name as customer_name, c.mobile as customer_mobile FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE c.mobile=? ORDER BY i.created_at DESC').all(mobile);
  },
  getInvoiceDetails: (id) => {
    const invoice = getDb().prepare('SELECT i.*, c.name as customer_name, c.mobile as customer_mobile FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.id=?').get(id);
    const items = getDb().prepare('SELECT ii.*, p.name as product_name FROM invoice_items ii JOIN products p ON ii.product_id = p.id WHERE ii.invoice_id=?').all(id);
    return { ...invoice, items };
  },

  // Dashboard Stats
  getDashboardStats: () => {
    const db_instance = getDb();
    const stats = {
      totalSales: db_instance.prepare('SELECT SUM(total_amount) as total FROM invoices').get().total || 0,
      dailySales: db_instance.prepare("SELECT SUM(total_amount) as total FROM invoices WHERE date(created_at) = date('now')").get().total || 0,
      weeklySales: db_instance.prepare("SELECT SUM(total_amount) as total FROM invoices WHERE date(created_at) >= date('now', '-7 days')").get().total || 0,
      monthlySales: db_instance.prepare("SELECT SUM(total_amount) as total FROM invoices WHERE date(created_at) >= date('now', '-30 days')").get().total || 0,
      yearlySales: db_instance.prepare("SELECT SUM(total_amount) as total FROM invoices WHERE date(created_at) >= date('now', '-365 days')").get().total || 0,
      orderCount: db_instance.prepare('SELECT COUNT(*) as count FROM invoices').get().count || 0,
      customerCount: db_instance.prepare('SELECT COUNT(DISTINCT mobile) as count FROM customers').get().count || 0,
      lowStockCount: db_instance.prepare('SELECT COUNT(*) as count FROM products WHERE stock_qty < 5').get().count || 0,
      recentInvoices: db_instance.prepare('SELECT i.*, c.name as customer_name FROM invoices i JOIN customers c ON i.customer_id = c.id ORDER BY i.created_at DESC LIMIT 5').all()
    };
    return stats;
  },

  // Purchases (Procurement)
  getPurchases: () => getDb().prepare('SELECT pr.*, p.name as product_name FROM purchases pr JOIN products p ON pr.product_id = p.id ORDER BY pr.purchase_date DESC').all(),
  addPurchase: (data) => {
    const database = getDb();
    const transaction = database.transaction((purchase) => {
      const { product_id, supplier_name, purchase_price, qty } = purchase;
      database.prepare('INSERT INTO purchases (product_id, supplier_name, purchase_price, qty) VALUES (?, ?, ?, ?)').run(product_id, supplier_name, purchase_price, qty);
      database.prepare('UPDATE products SET stock_qty = stock_qty + ?, cost_price = ? WHERE id = ?').run(qty, purchase_price, product_id);
    });
    return transaction(data);
  },

  // Settings
  getSettings: () => {
    const rows = getDb().prepare('SELECT * FROM settings').all();
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  },
  updateSettings: (settings) => {
    const database = getDb();
    const update = database.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const transaction = database.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        update.run(key, String(value));
      }
    });
    return transaction(settings);
  },
  resetSales: () => {
    const database = getDb();
    const transaction = database.transaction(() => {
      database.prepare('DELETE FROM invoice_items').run();
      database.prepare('DELETE FROM invoices').run();
      // Optional: Reset product stock to a default or keep as is? 
      // Based on "reset all sales", usually we just clear history.
      // If we want to restore stock, that would be complex without a stock log.
    });
    return transaction();
  }
};

module.exports = { getDb, queries };
