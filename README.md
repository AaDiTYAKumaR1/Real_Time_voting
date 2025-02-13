# Real-Time Voting System

This is a real-time voting system built using Fastify, Prisma, and Zod for validation. The system allows users to create polls, retrieve poll details, and vote on polls with session-based tracking.

## Features
- Create a poll with multiple options
- Retrieve poll details
- Vote on a poll with session tracking to prevent duplicate votes

---

## Installation & Setup

### Prerequisites
- Node.js (v16+ recommended)
- PostgreSQL (or any Prisma-supported database)
- Fastify

### Install Dependencies
```bash
npm install
```

### Database Setup
1. Configure your `.env` file with your database connection string.
2. Run Prisma migrations:
```bash
npx prisma migrate dev
```

---

## API Endpoints

### **1. Create a Poll**
**Endpoint:** `POST /polls`

**Request Body:**
```json
{
  "title": "Favorite Programming Language?",
  "options": ["JavaScript", "Python", "Rust"]
}
```

**Response:**
```json
{
  "pollId": "<poll_id>",
  "message": "Poll created successfully"
}
```

---

### **2. Get Poll Details**
**Endpoint:** `GET /polls/:pollId`

**Response:**
```json
{
  "poll": {
    "id": "<poll_id>",
    "title": "Favorite Programming Language?",
    "options": [
      { "id": "<option_id>", "title": "JavaScript" },
      { "id": "<option_id>", "title": "Python" }
    ]
  }
}
```
---

### **3. Vote on a Poll**
**Endpoint:** `POST /poll/:pollId/vote`

**Request Body:**
```json
{
  "pollOptionId": "<option_id>"
}
```

**Response:**
```json
{
  "message": "You have successfully voted on this poll!"
}
```


