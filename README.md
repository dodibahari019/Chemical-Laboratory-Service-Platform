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
