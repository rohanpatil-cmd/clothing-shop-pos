# 👕 Luxury Clothing Shop - Desktop POS & Management System

A high-performance, premium desktop application designed for modern clothing retail businesses. Built with Electron and React, this system offers a seamless experience for managing inventory, tracking sales performance, and processing customer invoices with a state-of-the-art UI.

![Premium UI](https://img.shields.io/badge/UI-Aura_Glassmorphism-blueviolet?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_Electron_|_SQLite-blue?style=for-the-badge)

## ✨ key Features

### 📊 Executive Dashboard
- **Real-time Analytics**: Track Daily, Weekly, and Monthly revenue at a glance.
- **Hero Sales Card**: High-visibility "Today's Sales" counter with live tracking indicators.
- **Operational Insights**: Monitor total orders, customer growth, and low-stock alerts.
- **Recent Sales Feed**: Instant visibility into the latest 5 transactions.

### 📦 Smart Inventory Management
- **Visual Catalog**: Support for high-quality product images and thumbnails.
- **Stock Tracking**: Automated stock deduction upon sale and color-coded "Low Stock" warnings.
- **Admin-Only Controls**: Secure product addition, editing, and deletion for managers.
- **Categorization**: Manage clothing by size, color, and department.

### 🧾 Modern Point of Sale (POS) Invoicing
- **Visual Selection**: Browse products with a thumbnail-rich catalog.
- **Dynamic Cart**: Real-time quantity adjustments and instant total calculation.
- **Customer Lookup**: Fast search for existing customers by mobile or name.
- **Transaction History**: Comprehensive "Sales History" section with advanced date-based filtering.

### 👥 Customer Directory
- **Unified Directory**: Centralized base for contact info and membership dates.
- **Searchable Database**: Quickly find customers by Mobile, Name, or Email.

---

## 🔐 Role-Based Access Control

The system features built-in security to protect sensitive business data:

| Role | Access Level | Permissions |
| :--- | :--- | :--- |
| **Manager** (`admin`) | Full Control | Full Analytics, Inventory Editing, Sales History, POS |
| **Staff** (`user`) | Operational | Daily Sales only, Read-Only Inventory, POS |

**Default Credentials:**
- **Admin**: `admin` / `admin123`
- **User**: `user` / `user123`

---

## 🛠️ Technology Stack

- **Core**: Electron (Desktop Environment)
- **Frontend**: React + Vite (High-speed UI Rendering)
- **Styling**: Tailwind CSS (Glassmorphism & Aura Design)
- **Database**: SQLite (via `better-sqlite3`) for robust local storage.
- **Icons**: Emoji Glyphs for a clean, zero-dependency visual look.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Recommended: latest LTS)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YourUsername/clothing-shop-app.git
   cd clothing-shop-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application in development mode:
   ```bash
   npm run dev
   ```

### Building for Production
To package the app for Windows:
```bash
npm run build
```

---

## 📂 Project Structure
```text
/src
  /main         # Electron main process (DB & IPC handlers)
  /preload      # Security bridge between main and renderer
  /renderer     # React application
    /pages      # Dashboard, Inventory, Invoices, etc.
    /components # UI elements like Sidebar, Modals, StatCards
/shop.db        # Local SQLite database
```

---

## 🎨 Design Philosophy
The application uses a **Glassmorphism** design language, featuring:
- **Depth**: Soft shadows and layered cards.
- **Vibrant Gradients**: Used for high-impact metrics (Revenue/Growth).
- **Responsive Layout**: Sidebar-driven navigation with smooth page transitions.
- **Focused Icons**: High-contrast emojis for intuitive navigation.

---
*Developed with ❤️ for Retail Excellence.*
