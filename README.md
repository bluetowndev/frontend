# WorkTrack - Field Work Management System

WorkTrack is a comprehensive field work management application designed to simplify and track field operations. It enables real-time attendance tracking, GPS-enabled location services, distance calculations, site visit management, leave management, and comprehensive reporting dashboards.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [User Roles & Permissions](#user-roles--permissions)
- [Key Features Explained](#key-features-explained)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

WorkTrack is a full-stack web application built to manage field operations efficiently. It provides:

- **Real-time Attendance Tracking**: GPS-enabled check-ins with photo verification
- **Location-based Services**: Automatic location name resolution using Google Maps API
- **Distance Tracking**: Calculates travel distances between multiple locations
- **Site Visit Management**: Track site visits with detailed categorization
- **Leave Management**: Request, approve, and track employee leaves
- **Target & Achievement Tracking**: Set monthly targets and track achievements
- **Comprehensive Dashboards**: Role-based dashboards for users, admins, and state heads
- **Analytics & Reporting**: Detailed reports and analytics for performance monitoring

---

## ✨ Features

### Core Features

1. **Attendance Management**
   - Check-in/Check-out with GPS location
   - Photo verification for attendance
   - Multiple purpose tracking (Site Visit, Office Visit, etc.)
   - Real-time location name resolution
   - Transit distance calculation

2. **Site Visit Tracking**
   - Categorized site visits (Tower End, Customer End, etc.)
   - Site visit summaries with issue tracking
   - Visit type classification
   - Feedback collection

3. **Leave Management**
   - Leave application and approval workflow
   - Multiple leave types (Sick, Casual, Personal, Emergency)
   - State head approval system
   - Leave history tracking

4. **Distance & Movement Tracking**
   - Automatic distance calculation between locations
   - Total daily distance tracking
   - Point-to-point distance details
   - Transit time calculation

5. **Targets & Achievements**
   - Monthly target setting
   - Achievement tracking
   - Excel import/export functionality
   - Performance visualization

6. **Site Allocation**
   - Assign sites to users
   - District and state-wise organization
   - Site management interface

7. **Dashboard & Analytics**
   - User dashboard with personal stats
   - Admin dashboard with comprehensive analytics
   - State head dashboard for regional oversight
   - Real-time attendance monitoring
   - Top performers tracking
   - State-wise statistics

8. **Reporting**
   - Users without check-in/check-out
   - Users on leave
   - Absent users tracking
   - Site visit counts
   - Excel export functionality

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary (for images)
- **Image Processing**: Sharp
- **External APIs**: 
  - Google Maps API (Geocoding & Distance Matrix)
- **Other**: 
  - bcrypt (password hashing)
  - nodemailer (email sending)
  - multer (file upload handling)
  - validator (input validation)

### Frontend
- **Framework**: React.js
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Material-UI (@mui/material)
  - React Icons
  - Framer Motion (animations)
- **Data Visualization**: Chart.js, React Chart.js 2
- **Forms**: Formik, Yup (validation)
- **Date Handling**: date-fns, react-datepicker
- **Notifications**: react-hot-toast
- **Excel**: xlsx (import/export)
- **Maps**: react-simple-maps
- **Camera**: react-webcam

---

## 📁 Project Structure

```
Worktrack_code_old/
├── backend/                    # Backend application
│   ├── controllers/           # Request handlers
│   │   ├── attendaceController.js
│   │   ├── userController.js
│   │   ├── leaveController.js
│   │   ├── siteAllocationController.js
│   │   ├── userTargetController.js
│   │   └── userAchievementController.js
│   ├── models/               # MongoDB schemas
│   │   ├── userModel.js
│   │   ├── attendanceModel.js
│   │   ├── leaveModel.js
│   │   ├── distanceModel.js
│   │   ├── siteAllocationModel.js
│   │   ├── siteVisitSummaryModel.js
│   │   ├── userTargetModel.js
│   │   └── userAchievementModel.js
│   ├── routes/               # API routes
│   │   ├── attendance.js
│   │   ├── user.js
│   │   ├── leave.js
│   │   ├── siteAllocation.js
│   │   ├── userTarget.js
│   │   └── userAchievement.js
│   ├── middleware/           # Custom middleware
│   │   └── requireAuth.js    # JWT authentication
│   ├── utils/                # Utility functions
│   │   └── sendEmail.js
│   ├── uploads/              # Temporary upload directory
│   ├── server.js             # Entry point
│   └── package.json
│
├── frontend/                  # Frontend application
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── StateHead/    # State head components
│   │   │   └── ...           # Shared components
│   │   ├── pages/            # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── StateheadDashboard.js
│   │   │   └── Dahboard.js
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Context providers
│   │   │   └── AuthContext.js
│   │   ├── utils/            # Utility functions
│   │   ├── App.js            # Root component
│   │   └── index.js          # Entry point
│   └── package.json
│
└── Documentation files
    ├── README.md
    ├── DISTANCE_FIX_FINAL.md
    ├── API_OPTIMIZATION_SUMMARY.md
    └── ...
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn
- Google Maps API key
- Cloudinary account (for image storage)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the backend directory:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/worktrack
   SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GMAP_API_KEY=your_google_maps_api_key
   ```

4. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:4000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
- `PORT`: Server port (default: 4000)
- `MONGO_URI`: MongoDB connection string
- `SECRET`: JWT secret key for token signing
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `GMAP_API_KEY`: Google Maps API key

#### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL

### Google Maps API Setup

1. Create a project in Google Cloud Console
2. Enable the following APIs:
   - Geocoding API
   - Distance Matrix API
3. Create an API key and restrict it to the enabled APIs
4. Add the key to your backend `.env` file

### Cloudinary Setup

1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Add them to your backend `.env` file

### CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:3000` (development)
- `https://frontend-09jj.onrender.com` (production)

Update `backend/server.js` to add additional origins if needed.

---

## 📡 API Documentation

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/user/signup` | Create new user (admin only) | No |
| POST | `/api/user/login` | User login | No |
| GET | `/api/user/all` | Get all users | Yes |
| GET | `/api/user/user-details?email=<email>` | Get user by email | No |
| GET | `/api/user/engineers?state=<state>` | Get engineers by state | Yes |
| DELETE | `/api/user/deleteUser?email=<email>` | Delete user | Yes |
| PUT | `/api/user/updateUser` | Update user | Yes |

#### Attendance

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/attendance` | Mark attendance | Yes |
| GET | `/api/attendance?date=<date>` | Get attendance by date | Yes |
| GET | `/api/attendance/all` | Get all attendance records | Yes |
| GET | `/api/attendance/filtered?state=<state>&startDate=<date>&endDate=<date>` | Get filtered attendance | Yes |
| GET | `/api/attendance/user?email=<email>` | Get attendance by email | Yes |
| GET | `/api/attendance/with-distances?date=<date>` | Get attendance with distances | Yes |
| GET | `/api/attendance/summary?startDate=<date>&endDate=<date>&holidays=<dates>` | Get attendance summary | Yes |
| POST | `/api/attendance/save-total-distance` | Save total distance | Yes |
| GET | `/api/attendance/no-checkin` | Users without check-in | Yes |
| GET | `/api/attendance/no-checkout?startDate=<date>&endDate=<date>` | Users without check-out | Yes |
| GET | `/api/attendance/onLeave` | Users on leave | Yes |
| GET | `/api/attendance/siteCount?startDate=<date>&endDate=<date>` | Site visit counts | Yes |
| GET | `/api/attendance/absent?startDate=<date>&endDate=<date>` | Users without attendance | Yes |
| GET | `/api/attendance/dashboard-stats` | User dashboard stats | Yes |
| GET | `/api/attendance/admin-dashboard-stats?state=<state>&startDate=<date>&endDate=<date>` | Admin dashboard stats | Yes |
| GET | `/api/attendance/movement-tracking?userId=<id>&email=<email>&state=<state>&startDate=<date>&endDate=<date>` | User movement tracking | Yes |
| POST | `/api/attendance/migrate-distances` | Migrate historical distances | Yes |
| GET | `/api/attendance/first-entry` | Check if first entry today | Yes |
| GET | `/api/attendance/last-site-visit` | Get last site visit | Yes |
| POST | `/api/attendance/site-visit-summary` | Save site visit summary | Yes |

#### Leave Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/leaves` | Create leave request | Yes |
| GET | `/api/leaves` | Get user's leaves | Yes |
| GET | `/api/leaves/:id` | Get leave by ID | Yes |
| PUT | `/api/leaves/:id/approve` | Approve leave (state head) | Yes |
| PUT | `/api/leaves/:id/reject` | Reject leave (state head) | Yes |
| GET | `/api/leaves/pending` | Get pending leaves (state head) | Yes |

#### Site Allocation

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/site-allocation` | Create/update site allocation | Yes |
| GET | `/api/site-allocation/:userId` | Get sites for user | Yes |
| GET | `/api/site-allocation` | Get all allocations | Yes |
| DELETE | `/api/site-allocation/:id` | Delete site allocation | Yes |

#### User Targets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/user-targets` | Create/update targets | Yes |
| GET | `/api/user-targets/:userId` | Get targets for user | Yes |
| GET | `/api/user-targets` | Get all targets | Yes |
| DELETE | `/api/user-targets/:id` | Delete target | Yes |

#### User Achievements

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/user-achievements` | Create/update achievements | Yes |
| GET | `/api/user-achievements/:userId` | Get achievements for user | Yes |
| GET | `/api/user-achievements` | Get all achievements | Yes |
| DELETE | `/api/user-achievements/:id` | Delete achievement | Yes |

### Request/Response Examples

#### Mark Attendance
**Request:**
```javascript
POST /api/attendance
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  image: <base64_image>,
  location: JSON.stringify({ lat: 28.6139, lng: 77.2090 }),
  purpose: "Site Visit",
  subPurpose: "Tower End",
  feedback: "Optional feedback"
}
```

**Response:**
```json
{
  "message": "Attendance saved successfully"
}
```

#### Get Attendance Summary
**Request:**
```
GET /api/attendance/summary?startDate=2024-01-01&endDate=2024-01-31&holidays=2024-01-26,2024-01-15
Authorization: Bearer <token>
```

**Response:**
```json
{
  "holidays": 2,
  "present": 22,
  "absent": 5,
  "workDays": 23
}
```

---

## 🗄 Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['user', 'admin', 'statehead']),
  fullName: String (required),
  phoneNumber: String (required),
  reportingManager: String (required),
  state: String (required),
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

### Attendance Model
```javascript
{
  image: String (Cloudinary URL, required),
  location: {
    lat: Number (required),
    lng: Number (required)
  },
  locationName: String (required),
  purpose: String (required),
  subPurpose: String,
  feedback: String (maxlength: 50),
  timestamp: Date (default: Date.now),
  date: String (YYYY-MM-DD, required),
  user: ObjectId (ref: 'User', required)
}
```

### Leave Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  startDate: Date (required),
  endDate: Date (required),
  reason: String (required),
  leaveType: String (enum: ['Sick Leave', 'Casual Leave', 'Personal Leave', 'Emergency Leave']),
  status: String (enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending'),
  approver: ObjectId (ref: 'User'),
  approvedAt: Date,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Distance Model (TotalDistance)
```javascript
{
  userId: ObjectId (ref: 'User', required),
  date: String (YYYY-MM-DD, required),
  totalDistance: Number (kilometers),
  pointToPointDistances: [{
    from: String,
    to: String,
    distance: Number,
    transitTime: String
  }]
}
```

### Site Allocation Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  sites: [{
    siteName: String (required),
    district: String (required),
    state: String (required),
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### User Target Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  targets: [{
    month: String (enum: ['September', 'October', ..., 'August']),
    year: Number (required),
    target: Number (required, min: 0),
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### User Achievement Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  achievements: [{
    month: String (enum: ['September', 'October', ..., 'August']),
    year: Number (required),
    achievement: Number (required, min: 0),
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Site Visit Summary Model
```javascript
{
  attendance: ObjectId (ref: 'Attendance', required),
  visitType: String,
  issue: String,
  user: ObjectId (ref: 'User', required),
  createdAt: Date
}
```

---

## 👥 User Roles & Permissions

### 1. User (Field Employee)
- Mark attendance (check-in/check-out)
- Record site visits with photos
- Apply for leaves
- View personal dashboard
- View personal attendance history
- View targets and achievements

### 2. State Head
- All user permissions
- Approve/reject leave requests for their state
- View state-wise statistics
- View state head dashboard

### 3. Admin
- All permissions
- Create/manage users
- Access admin dashboard
- View all attendance data
- Manage site allocations
- Upload targets and achievements (Excel)
- View comprehensive analytics
- Export reports
- System configuration

---

## 🔑 Key Features Explained

### 1. Attendance Marking

Users can mark attendance with:
- **Photo capture**: Using device camera
- **GPS location**: Automatically captured
- **Location name**: Resolved using Google Maps Geocoding API
- **Purpose**: Various options (Check In, Site Visit, Office Visit, etc.)
- **Sub-purpose**: Further categorization (e.g., Tower End, Customer End)
- **Feedback**: Optional feedback field

Images are compressed to under 10KB before upload to Cloudinary.

### 2. Distance Calculation

The system calculates distances using Google Maps Distance Matrix API:
- **Transit distances**: Between consecutive locations
- **Total distance**: Sum of all transit distances for a day
- **Point-to-point details**: From/to locations with distances
- **Transit time**: Time between locations

Distances are cached to reduce API costs (75% savings achieved through optimization).

### 3. Leave Management

Leave workflow:
1. User submits leave request
2. State head receives notification
3. State head approves/rejects
4. User receives notification
5. Leave status updated

### 4. Dashboard Analytics

#### User Dashboard
- Attendance rate
- Average check-in time
- Site visits count
- Today's distance
- Monthly total distance
- Attendance trends

#### Admin Dashboard
- Total users and active users
- State-wise statistics
- Top performers
- Daily trends
- Recent activity
- Distance analytics
- Attendance reports

### 5. Site Visit Tracking

Site visits are categorized with:
- Visit type (Tower End, Customer End, etc.)
- Issue tracking
- Summary collection
- Location details
- Timestamp

### 6. Target & Achievement Management

- Monthly targets can be set per user
- Achievements tracked monthly
- Excel import/export support
- Performance visualization
- Comparison analytics

---

## 💻 Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd frontend
npm start  # Runs on http://localhost:3000
```

### Code Structure Guidelines

- **Backend Controllers**: Handle business logic and API responses
- **Models**: Define database schemas with Mongoose
- **Routes**: Define API endpoints and middleware
- **Frontend Components**: Reusable UI components
- **Pages**: Route-level components
- **Hooks**: Custom React hooks for data fetching
- **Context**: Global state management

### API Optimization

The project includes several optimizations:
- **Geocoding Cache**: Reduces Google Maps API calls by 60-80%
- **Distance Cache**: Stores calculated distances in database
- **Batch Processing**: Efficient handling of multiple requests

See `API_OPTIMIZATION_SUMMARY.md` for details.

---

## 🚢 Deployment

### Backend Deployment

1. **Environment Setup**
   - Set all environment variables on hosting platform
   - Ensure MongoDB connection string is configured
   - Verify API keys are set

2. **Build & Deploy**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

3. **Recommended Platforms**
   - Render
   - Heroku
   - AWS Elastic Beanstalk
   - DigitalOcean App Platform

### Frontend Deployment

1. **Build for Production**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy Build Folder**
   - The `build` folder contains optimized production files
   - Deploy to:
     - Netlify
     - Vercel
     - AWS S3 + CloudFront
     - GitHub Pages

3. **Environment Variables**
   - Set `REACT_APP_API_URL` to production backend URL

### Database Setup

- Use MongoDB Atlas for cloud database
- Ensure proper connection string configuration
- Set up database indexes for performance
- Configure backups

---

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify backend CORS configuration includes frontend URL
   - Check allowed origins in `server.js`

2. **Image Upload Failures**
   - Verify Cloudinary credentials
   - Check image size (should be < 10KB after compression)
   - Ensure proper image format

3. **Google Maps API Errors**
   - Verify API key is valid
   - Check API quotas
   - Ensure required APIs are enabled

4. **Authentication Issues**
   - Verify JWT secret is set
   - Check token expiration
   - Ensure token is included in Authorization header

5. **Distance Calculation Issues**
   - Verify Google Maps Distance Matrix API is enabled
   - Check API quota limits
   - Review distance calculation logic in controller

### Performance Optimization

- Enable MongoDB indexes on frequently queried fields
- Use pagination for large datasets
- Implement caching where appropriate
- Optimize image sizes before upload
- Use database connection pooling

---

## 📄 License

This project is proprietary software developed for internal use.

---

## 👨‍💻 Development Team

For questions or support, please contact the development team.

---

**Last Updated**: December 2025
