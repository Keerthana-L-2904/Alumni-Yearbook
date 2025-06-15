A full-stack web application for managing alumni registrations, approvals, and engagement.  
Features:
- Admin 
  - Approve/reject alumni registrations.  
  - Create news and events.  
- Alumni
  - Submit yearbook stories/photos.  
  - Search and connect with other alumni.
  - Donate
- Authentication  
  - JWT (Admins).  
  - Passport.js + Google OAuth (Alumni).
    
Tech Stack  
Frontend  
- HTML/CSS/JavaScript.  
- Fetch API for backend communication.  
Backend
- Node.js + Express.js (REST API)  
- MongoDB (Database)  
- Mongoose (ORM)  

Setup & Installation  
1. Prerequisites  
- Node.js (v14+).  
- MongoDB (local/cloud).  
- Google OAuth credentials (for alumni login).  

2. Backend Setup  
```bash
# Clone the repo
git clone <repo-url>

# Install dependencies
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB/Google OAuth/JWT secrets

# Start the server
npm start
```
3. Frontend Setup  
- Open `index.html` in a browser
  
Database Schemas 

1. Admin (Admin.js)
  •	Fields: name, email (unique), phone, password (hashed).
  •	Methods:
  o	matchPassword: Compares plaintext vs hashed password.
2. Alumni (Alumni.js)
  •	Fields:
  o	Core: name, email (unique), phone, occupation, company, graduationYear.
  o	Status: isVerified, isApproved, isRejected.
  o	File: collegeIdPath (uploaded ID).
  •	Nested Collections:
    o	PendingAlumni: Unverified registrations.
    o	VerifiedAlumni: Approved alumni.
3. News/Event (NewsEvent.js)
  •	News: title, content, createdAt, createdBy (Admin _id).
  •	Event: title, content, eventDate, createdAt, createdBy.
4. Yearbook (Yearbook.js)
  •	Story: name, graduationYear, title, story, submittedBy (Alumni _id).
  •	Photo: name, batch, description, filename, submittedBy.

