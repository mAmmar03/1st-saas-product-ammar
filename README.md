# AmmarDev - Influencer CRM & PR Tracking System

A full-stack Influencer Relationship Management (IRM) system built with **React (Vite + Tailwind CSS)** and **Node.js (Express + MongoDB)**.

---

## 🌟 Key Features

1. **PR Inventory & Auto-Deduction Hub**:
   - Set total PR quota pieces for every article/product.
   - Real-time stock calculation: `Total Allocated`, `Dispatched (Sent)`, and `Remaining Stock`.
   - Complete recipient audit log: **"Kis Ko Gaye Hain"** (with courier & tracking details) and **"Kis Ko Jaane Hain"** (reserved in locked collaborations).
   - Atomic deduction when dispatching, with instant restore capability if reverted.

2. **Influencer Bio-Data Files & Dossier**:
   - One-click profile dossier showing lifetime collaboration history.
   - Total deals value, payments cleared vs pending balance.
   - Comprehensive log of every article received.
   - Delivered and pending live video deliverables with Instagram links.
   - Shipping address and bank payment credentials.

3. **Campaigns & Commercials Tracker**:
   - Record agreed deal price and per-video rate.
   - Manual workflow control: Dispatch PR parcels with courier tracking.
   - Deliverable stages: `Pending` ➔ `Draft Received` ➔ `Approved` ➔ `Video Live`.
   - Payment status: `Unpaid` ➔ `Advance Paid` ➔ `Fully Paid`.

---

## 🚀 How to Run the System

### 1. Start the Backend Server (Port 5000)
Open a terminal and run:
```bash
cd G:\AmmarDev\server
npm run dev
```

### 2. Start the Frontend React App (Port 3000)
Open a second terminal and run:
```bash
cd G:\AmmarDev\client
npm run dev
```

Then open your browser at **`http://localhost:3000`**.

---

## 📁 Clean Project Architecture

```
G:\AmmarDev\
├── client\                  # React (Vite + Tailwind CSS)
│   ├── public\              # Brand logo & assets
│   ├── src\
│   │   ├── components\      # Navbar, Dossier, Modals (Collab, Article, Influencer, Dispatch)
│   │   ├── pages\           # Dashboard, DealsManager, PRInventory, InfluencersDirectory
│   │   ├── services\        # Axios API wrapper (http://localhost:5000/api)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server\                  # Node.js + Express + Mongoose
│   ├── src\
│   │   ├── config\          # Database connection
│   │   ├── controllers\     # Business logic & atomic stock deduction
│   │   ├── models\          # Article, Influencer, Deal
│   │   ├── routes\          # Express API endpoints
│   │   ├── seed.js          # Sample initial demo data
│   │   └── server.js        # Main entrypoint
│   ├── .env
│   └── package.json
│
└── package.json             # Root workspace scripts
```
