# Campus Access Pass
A role-based campus resource access management system that allows students to request access to campus facilities, authorized approvers to review requests, and verifiers to validate time-limited access passes.

# Problem Statement
Campus facilities often need controlled access based on a user's role, approval status, resource availability, and permitted access period. Campus Access Pass centralizes this workflow and records access-related actions for accountability.

# Key Features
- Role-based access for Students, Approvers, Verifiers, and Administrators
- Campus resource listing and management
- Time-bound access requests
- Approval and rejection workflow
- Access pass generation after approval
- Pass validation based on status, time window, and resource status
- Administrative pass revocation
- Audit logs for access-related actions
- Security alerts for suspicious verification activity
- Authentication using JSON Web Tokens (JWT)
- Password hashing using bcrypt
- Request validation, rate limiting, security headers, and parameterized SQL queries

# User Roles
Role	Responsibilities
Student	Browse resources, submit requests, view personal requests and passes
Approver	Review pending requests and approve or reject them
Verifier	Validate an access pass for a resource
Admin	Manage resources, revoke passes, and review audit logs and security alerts

## Technology Stack
# Backend
- Node.js
- Express
- MySQL
- mysql2
- JSON Web Tokens (jsonwebtoken)
- bcrypt
- Zod
- Helmet
- CORS
- Express Rate Limit
- dotenv

# Frontend
- React and Vite, subject to confirmation against the committed frontend package and source files

# Application Workflow
1. A student selects a campus resource and submits an access request for a specified time window.
2. An authorized approver reviews the request.
3. If approved, the system creates a time-limited access pass.
4. A verifier submits the pass and resource identifiers for validation.
5. The backend checks the pass status, validity period, and resource status before returning an access decision.
6. Verification attempts and relevant administrative actions are recorded for auditing.

# Database Design
The MySQL database uses the following tables:
- users: accounts, password hashes, and roles
- resources: campus facilities and their active status
- access_requests: requested time windows and approval decisions
- access_passes: approved access windows and revocation status
- audit_logs: recorded actions and verification outcomes
- security_alerts: suspicious activity requiring review

The schema is available in database/schema.sql.

## Getting Started
# Prerequisites
- Node.js and npm
- MySQL Server
- Git