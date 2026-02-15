# Chemical Laboratory Management System (ChemLabSys)

A web-based Chemical Laboratory Management System built with React, Node.js, and MySQL that manages laboratory requests, tools, reagents, scheduling, and payment transactions through an integrated system.

---

## Project Overview

ChemLabSys is a full-stack web application designed to support the operational management of an independent chemical laboratory.

The system digitalizes laboratory processes including:

- User registration and authentication
- Laboratory tools and reagent catalog management
- Request submission and approval workflow
- Scheduling management
- Payment processing (Midtrans Sandbox)
- Administrative monitoring and reporting

Customers can submit laboratory usage requests by selecting tools and reagents, defining schedules, and completing payments through Midtrans (sandbox simulation).

Admin and staff manage operational workflows including request approval, schedule control, inventory monitoring, and payment tracking via a centralized dashboard.

This project was developed as part of a Database Programming course to simulate a real-world laboratory management system with structured relational database design.

---

## User Roles & Features

### Customer

- User registration (local authentication)
- Login to system
- Browse tools and reagents catalog
- Add items to cart
- Submit laboratory usage request
- Select schedule (date & duration)
- Define usage purpose (research, practicum, R&D, etc.)
- Complete payment via Midtrans (sandbox mode)
- Track request and payment status

### Admin & Staff

- Dashboard overview (monthly analytics & statistics)
- Manage requests (approve / reject)
- Manage schedules (cancel / complete / no-show)
- Manage payments (monitor pending, paid, failed)
- Manage tools (add, update, bulk upload via Excel)
- Manage reagents (stock monitoring, expired tracking)
- Manage users (role-based access control)

---

## Technical Implementation

- Full-stack architecture (Frontend & Backend separated)
- RESTful API design
- Relational database modeling using ERD
- Role-based access control (RBAC)
- Payment gateway integration (Midtrans Sandbox)
- Bulk data import/export (Excel support)
- Status-based workflow system
- Inventory and expiration tracking
- Structured database normalization

## Database Design
The system is built using a relational database (MySQL) consisting of 12 core tables:

- users
- requests
- tools
- reagents
- request_tools
- request_reagents
- schedules
- payments
- cancellations
- damages
- reagent_logs
- notifications

The database design ensures:
- Data integrity through primary & foreign keys
- Many-to-many relationships via bridge tables
- Transaction traceability
- Structured workflow management
- Stock and expiration monitoring

The ERD was designed to minimize redundancy and maintain normalization consistency.

Current Limitations
- Payment system uses Midtrans Sandbox (simulation only)
- No real-time IoT or hardware integration
- Safety SOP recorded administratively (no physical enforcement)
- No predictive analytics or AI-based optimization
- Single laboratory scope (not multi-branch)

Future Improvements
- Real-time laboratory usage tracking
- Automated stock deduction system
- Notification automation (email / SMS)
- Multi-laboratory support
- Advanced reporting & analytics
- Production-level payment configuration
- Performance optimization
  
## Tech Stack

### Backend
- Node.js
- Express.js
- RESTful API

### Frontend
- React.js
- Vite
- Tailwind CSS

### Database
- MySQL (Initially planned for PostgreSQL but migrated due to deployment constraints)

### Third-Party Integration
- Midtrans (Sandbox Mode)

---

## Screenshots

<img width="1366" height="617" alt="image" src="https://github.com/user-attachments/assets/f27c0064-e613-409f-9a67-cb348611332f" />
<img width="1366" height="618" alt="image" src="https://github.com/user-attachments/assets/477e55a9-6250-4efd-9308-6a794103fbd6" />
<img width="1363" height="617" alt="image" src="https://github.com/user-attachments/assets/0870447c-2800-4a29-b9d6-26218390cd91" />
<img width="1365" height="620" alt="image" src="https://github.com/user-attachments/assets/1f27edb0-5fd4-4fed-9a6d-2cccca95c150" />
<img width="1366" height="616" alt="image" src="https://github.com/user-attachments/assets/32339d7b-85a7-4dce-a26d-dbec7ca650bd" />
<img width="1366" height="616" alt="image" src="https://github.com/user-attachments/assets/e38297d2-c826-40ee-bb85-5dc3835dde35" />
<img width="1366" height="611" alt="image" src="https://github.com/user-attachments/assets/95a7144f-4f3a-4c2c-b589-7533436cdd2e" />
<img width="1366" height="615" alt="image" src="https://github.com/user-attachments/assets/30ec3132-cb88-4fe6-a121-eacad83f9bc3" />
<img width="1366" height="609" alt="image" src="https://github.com/user-attachments/assets/51ad36e1-b528-488a-916d-03a98163e92b" />






