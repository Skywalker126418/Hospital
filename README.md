# 🏥 Metropolitan Hospital Management System (HMS)
### HCI Academic Artifact & Interactive 3D/4D Full-Stack Healthcare Platform

A production-grade, secure, responsive, and human-centered Hospital Management System built with **React**, **Three.js / React Three Fiber**, **Node.js + Express**, and a **MySQL** relational database.

---

## 🌟 Key Highlights & Academic Objectives
- **HCI Principles Applied:** Visibility of system status, error prevention (prevention of double bookings and critical allergy warnings), minimal user effort, consistency, accessibility, and graceful degradation.
- **Real-Time 3D/4D Medical Visualizations:**
  - **4D Biomorphic Cardiac Model:** Simulating real-time dual-ventricle systolic/diastolic pulsation (72 BPM) with wireframe toggles.
  - **3D Anatomical Human Body Inspector:** Multi-layer inspection (Skeletal, Organs, All) with clickable physiological nodes.
  - **3D Hospital Architectural Campus:** Spatial department locator for campus navigation.
  - **Robust Fallback Engine:** `Model3DErrorBoundary` guarantees the UI never crashes on low-spec hardware or when WebGL acceleration is unavailable.
- **Relational Persistence:** Strictly powered by MySQL (`hospital_management_system`) with foreign keys, transactional integrity, and parameterized queries.
- **Modular Multi-File Architecture:** Clean separation of concerns with independent pages, reusable components, feature services, centralized middleware, and database controllers.

---

## 🏛️ System Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │    React + Tailwind CSS Client (Vite 5)     │
                  │   Three.js / React Three Fiber 3D Canvases  │
                  └──────────────────────┬───────────────────────┘
                                         │ REST API / Axios
                                         │ (JWT Bearer Token)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       Node.js + Express.js API Server        │
                  │  (Auth, RBAC, Validation, Controllers, Pool) │
                  └──────────────────────┬───────────────────────┘
                                         │ mysql2/promise Pool
                                         │ Transactions & Locking
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │        MySQL Database Service (3306)         │
                  │        `hospital_management_system`          │
                  └──────────────────────────────────────────────┘
```

---

## 👥 Default Demo Credentials & Roles

| Role | Email Address | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@hospital.com` | `Admin123!` | Full system oversight, staff user management, financial billing, reports, hospital settings |
| **Attending Doctor** | `doctor.claude@hospital.com` | `Doctor123!` | Clinical patient consultations, diagnosis, multi-item prescriptions, lab test orders & results |
| **Attending Doctor** | `doctor.smith@hospital.com` | `Doctor123!` | Specialist cardiology consultations, ECG & biomarker reviews |
| **Front Desk Receptionist**| `receptionist@hospital.com` | `Reception123!` | Patient registration, live check-ins, appointment booking with double-booking prevention |

*Note: The application also includes an instant **1-Click Quick Demo** switcher on the Navbar and Login page for rapid evaluation.*

---

## 🚀 Quick Start & Installation

### 1. Database Configuration (MySQL)
Ensure your MySQL service is running (e.g., via XAMPP or native service on port `3306`).
```bash
# Schema creation and tables setup
mysql -u root < database/schema.sql

# Seed initial medical data, staff credentials, and patients
cd backend
npm run seed
```

### 2. Backend API Server Setup
```bash
cd backend
npm install
npm start
# Server runs live on http://localhost:5000
```

### 3. Frontend Web Application Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🧪 Testing Checklist & Verification
- [x] **Authentication:** Email & password authentication with bcrypt hashing, JWT issuance, session validation, and optional Google SSO mock handler.
- [x] **Patient Registration:** Full demographic validation, duplicate National ID prevention, assigned `PAT-YYYY-XXXX` code, and immediate registration receipt modal.
- [x] **Appointment Scheduling:** Real-time doctor slot calculation (08:30 - 16:30), slot states (Available, Selected, Booked), double-booking prevention with database transactional locking.
- [x] **Physician Workstation:** Patient queue, diagnosis & symptoms recording, appointment auto-completion to 'completed', multi-item prescriptions (`MedicineRow`).
- [x] **Laboratory Diagnostics:** Test ordering, technician quality control notes, normal/abnormal findings recording.
- [x] **Billing & Invoices:** Itemized invoicing, payment recordings (Cash, Card, Bank Transfer, Mobile Money), and dedicated `@media print` invoice layout.
- [x] **3D/4D Medical Graphics:** Interactive biomorphic cardiac model, 3D anatomical human body, hospital pavilion, and WebGL error boundary fallback.
- [x] **HCI Artifacts:** Complete Low-Fidelity Prototype (`/prototype`) and Usability Evaluation Audit (`/evaluation`) detailing 6 persona issues mapped to Jakob Nielsen's heuristics.
