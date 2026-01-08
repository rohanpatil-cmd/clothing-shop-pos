# Clothing Shop Desktop Application - Implementation Plan

## 1. Project Overview
A modern, efficient desktop application for a clothing retail shop. The app will handle inventory management, invoice processing, and customer data, with local SQLite storage and automated Google Drive backups.

**Tech Stack**:
- **Framework**: Electron (for Desktop capabilities)
- **Frontend**: React + Vite (for high-performance UI)
- **Styling**: TailwindCSS (for modern, clean aesthetics)
- **Database**: SQLite (via `better-sqlite3`)
- **Backup**: Google Drive API (via `googleapis`)

## 2. Architecture
The app will use a standard Electron architecture:
- **Main Process**: Handles window management, database operations (SQLite), file system access, and Google Drive backups.
- **Renderer Process**: The React UI. It communicates with the Main process using `ContextBridge` and `IPC` (Inter-Process Communication).

## 3. Core Modules & Features

### A. Customer Management
- **Data**: Name, Mobile (Primary Key).
- **Features**: Auto-search by mobile during invoicing.

### B. Inventory Management
- **Data**: Product Name, Category, Size, Color, Stock Qty, Cost Price, Selling Price.
- **Features**: CRUD operations, Low-stock visual indicators.

### C. Invoice Processing
- **UI**: Searchable product list, cart functionality (adjust qty, prices).
- **Logic**: Auto-calculate totals, tax support (optional toggle), stock deduction on finalize.
- **Output**: PDF Export (using `jspdf` or window printing).

### D. Data & Backup
- **Local**: `shop.db` (SQLite) stored in `AppData`.
- **Cloud**: Daily backup routine uploading `shop.db` to a specific Google Drive folder.

## 4. UI/UX Design System
- **Theme**: Light mode (default) with clean whites/grays, inspired by the reference image.
- **Navigation**: Sidebar layout (Invoices, Inventory, Customers, Settings).
- **Style**: Rounded corners, soft shadows, clear typography (Inter/Roboto).

## 5. Development Steps
1. **Setup**: Initialize Electron + Vite + React + Tailwind. [DONE]
2. **Database**: specific schema setup (Tables: `products`, `customers`, `invoices`, `invoice_items`). [DONE]
3. **IPC Bridge**: Create secure API for frontend to call backend DB functions.
4. **Frontend Implementation**:
    - Layout & Sidebar
    - Inventory Page (Data Grid)
    - Invoice Page (POS style)
    - Customer Page
5. **Backup Service**: Implement Google OAuth flow and file upload.
6. **Final Polish**: PDF generation, animations, error handling.

## 6. Directory Structure
```
/src
  /main         # Electron main process
  /preload      # Context bridge
  /renderer     # React App
    /src
      /components
      /pages
      /styles
```
