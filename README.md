# What Sikkimese Want!

A modern, full-stack web application that allows citizens of Sikkim to request basic amenities from the state government. Features a beautiful, responsive design with real Sikkim imagery and a comprehensive admin dashboard for managing requests.

## Features

### User Portal
- **Beautiful Hero Section** with Sikkim monastery imagery
- **Image Gallery** showcasing Sikkim's monasteries, mountains, and culture
- **Comprehensive Request Form** with multiple amenity options:
  - Gym/Fitness Center
  - Public Toilet
  - Library
  - Community Center
  - Playground
  - Healthcare Center
  - Drinking Water Facility
  - Street Lighting
  - Custom amenities
- **District Selection** for all 6 Sikkim districts:
  - Gangtok, Mangan, Namchi, Gyalshing, Pakyong, Soreng
- **Priority Levels** (Low, Medium, High, Urgent)
- **Real-time Form Validation**
- **Unique Reference ID** generation for tracking
- **Fully Responsive Design** for mobile, tablet, and desktop

### Admin Dashboard
- **Secure Login System** (default: admin/admin123)
- **Statistics Dashboard** showing:
  - Total requests
  - Pending, Approved, and Rejected counts
  - Distribution by district and priority
- **Advanced Filtering** by status, district, and priority
- **Request Management**:
  - View detailed request information
  - Update request status (Pending, In Progress, Approved, Rejected)
  - Add admin notes
  - Delete requests
- **Real-time Updates**

### Backend & Database
- **RESTful API** built with Express.js
- **JSON File Database** for persistent storage
- **CRUD Operations** for all data management
- **Reference ID Generation** for tracking
- **CORS Enabled** for frontend-backend communication

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: JSON file storage
- **Images**: Unsplash API (Sikkim-themed images)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Step 3: Access the Application

1. **User Portal**: http://localhost:3000
2. **Admin Dashboard**: http://localhost:3000/admin
   - Username: `admin`
   - Password: `admin123`

## Deployment

This app is ready to deploy on Railway, Render, or Heroku.

### Deploy to Railway
1. Push to GitHub
2. Go to railway.app
3. New Project → Deploy from GitHub
4. Select this repo
5. Done!

## License

MIT License

---

**Built for the Government of Sikkim**
*Your voice. Your district. Your future.*
