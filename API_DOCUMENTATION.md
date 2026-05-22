# WorkTrack API Documentation

Complete API reference for the WorkTrack application.

## Base URL

```
Development: http://localhost:4000
Production: <your-production-url>
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained from the `/api/user/login` endpoint and should be stored securely.

---

## User Management API

### Login

**POST** `/api/user/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user",
  "fullName": "John Doe",
  "state": "Delhi"
}
```

**Error Response (400/401):**
```json
{
  "error": "Incorrect email or password"
}
```

---

### Signup

**POST** `/api/user/signup`

Create a new user account. **Admin only.**

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "fullName": "Jane Doe",
  "phoneNumber": "+1234567890",
  "reportingManager": "Manager Name",
  "state": "Delhi"
}
```

**Response (200 OK):**
```json
{
  "email": "newuser@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user",
  "fullName": "Jane Doe"
}
```

**Error Responses:**
- `400`: Validation error
- `409`: Email already exists

---

### Get All Users

**GET** `/api/user/all`

Retrieve all users in the system. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "_id": "user_id_1",
    "email": "user1@example.com",
    "fullName": "User One",
    "phoneNumber": "+1234567890",
    "state": "Delhi",
    "role": "user",
    "reportingManager": "Manager Name"
  },
  ...
]
```

---

### Get User by Email

**GET** `/api/user/user-details?email=<email>`

Get user details by email address.

**Query Parameters:**
- `email` (required): User email address

**Response (200 OK):**
```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "fullName": "User Name",
  "phoneNumber": "+1234567890",
  "state": "Delhi",
  "role": "user",
  "reportingManager": "Manager Name"
}
```

---

### Update User

**PUT** `/api/user/updateUser`

Update user information. **Requires authentication.**

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullName": "Updated Name",
  "phoneNumber": "+9876543210",
  "state": "Mumbai",
  "reportingManager": "New Manager"
}
```

**Response (200 OK):**
```json
{
  "message": "User updated successfully"
}
```

---

### Delete User

**DELETE** `/api/user/deleteUser?email=<email>`

Delete a user account. **Requires authentication.**

**Query Parameters:**
- `email` (required): User email to delete

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Attendance API

### Mark Attendance

**POST** `/api/attendance`

Mark attendance with photo and location. **Requires authentication.**

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image`: Base64 encoded image string (data URI format)
- `location`: JSON string of location object `{"lat": 28.6139, "lng": 77.2090}`
- `purpose`: Attendance purpose (required)
  - Options: "Check In", "Site Visit", "BSNL Office Visit", "BT Office Visit", "New Site Survey", "Official Tour - Out of Station", "NEW BUSINESS OPPORTUNITY - FIRST MEETING", "BUSINESS DEVELOPMENT- FOLLOW UP MEETING", "Existing Client Meeting", "Preventive Measures", "On Leave", "Others", "Check Out"
- `subPurpose`: Optional sub-purpose (e.g., "Tower End", "Customer End")
- `feedback`: Optional feedback string (max 50 characters)

**Example Request:**
```javascript
const formData = new FormData();
formData.append('image', 'data:image/jpeg;base64,/9j/4AAQSkZJRg...');
formData.append('location', JSON.stringify({ lat: 28.6139, lng: 77.2090 }));
formData.append('purpose', 'Site Visit');
formData.append('subPurpose', 'Tower End');
formData.append('feedback', 'Router issue resolved');
```

**Response (201 Created):**
```json
{
  "message": "Attendance saved successfully"
}
```

**Error Responses:**
- `400`: Missing required fields or invalid image format
- `500`: Server error during processing

---

### Get Attendance by Date

**GET** `/api/attendance?date=YYYY-MM-DD`

Get all attendance records for the authenticated user on a specific date.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response (200 OK):**
```json
[
  {
    "_id": "attendance_id",
    "image": "https://res.cloudinary.com/...",
    "location": {
      "lat": 28.6139,
      "lng": 77.2090
    },
    "locationName": "123 Main St, City, State",
    "purpose": "Site Visit",
    "subPurpose": "Tower End",
    "feedback": "Router issue resolved",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "date": "2024-01-15",
    "user": "user_id"
  },
  ...
]
```

---

### Get All Attendance

**GET** `/api/attendance/all`

Get all attendance records for the authenticated user, sorted by timestamp.

**Response (200 OK):**
```json
[
  {
    "_id": "attendance_id",
    "image": "https://res.cloudinary.com/...",
    "location": {...},
    "locationName": "...",
    "purpose": "...",
    "timestamp": "...",
    "date": "...",
    "user": "..."
  },
  ...
]
```

---

### Get Filtered Attendance

**GET** `/api/attendance/filtered?state=<state>&startDate=<date>&endDate=<date>`

Get filtered attendance records based on state and date range. **Admin only.**

**Query Parameters:**
- `state`: State filter (use "all" for all states)
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Response (200 OK):**
```json
[
  {
    "_id": "attendance_id",
    "image": "...",
    "location": {...},
    "locationName": "...",
    "purpose": "...",
    "timestamp": "...",
    "date": "...",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "fullName": "User Name",
      "state": "Delhi",
      "phoneNumber": "...",
      "reportingManager": "..."
    }
  },
  ...
]
```

---

### Get Attendance with Distances

**GET** `/api/attendance/with-distances?date=YYYY-MM-DD`

Get attendance records with calculated distances between consecutive locations.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response (200 OK):**
```json
[
  {
    "_id": "attendance_id_1",
    "location": {...},
    "locationName": "Location 1",
    "timestamp": "...",
    ...
  },
  {
    "_id": "attendance_id_2",
    "location": {...},
    "locationName": "Location 2",
    "distanceFromPrevious": "5.2 km",
    "timestamp": "...",
    ...
  },
  ...
]
```

---

### Get Attendance Summary

**GET** `/api/attendance/summary?startDate=<date>&endDate=<date>&holidays=<dates>`

Get attendance summary statistics for a date range.

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format
- `holidays` (required): Comma-separated list of holiday dates (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "holidays": 2,
  "present": 22,
  "absent": 5,
  "workDays": 23,
  "futureHolidays": 0
}
```

---

### Save Total Distance

**POST** `/api/attendance/save-total-distance`

Save the total distance traveled for a day.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "totalDistance": "25.5 km",
  "pointToPointDistances": [
    {
      "from": "Location A",
      "to": "Location B",
      "distance": 5.2,
      "transitTime": "15 min"
    },
    {
      "from": "Location B",
      "to": "Location C",
      "distance": 20.3,
      "transitTime": "45 min"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Total distance and point-to-point distances with locations and transit time saved successfully.",
  "totalDistanceRecord": {
    "_id": "distance_id",
    "userId": "user_id",
    "date": "2024-01-15",
    "totalDistance": 25.5,
    "pointToPointDistances": [...]
  }
}
```

---

### Get Users Without Check-In

**GET** `/api/attendance/no-checkin`

Get list of users who haven't checked in today. **Admin/Dashboard role.**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "fullName": "User Name",
      "email": "user@example.com",
      "phoneNumber": "+1234567890",
      "state": "Delhi",
      "reportingManager": "Manager Name"
    },
    ...
  ]
}
```

---

### Get Users Without Check-Out

**GET** `/api/attendance/no-checkout?startDate=<date>&endDate=<date>`

Get list of users who haven't checked out for the specified date range.

**Query Parameters:**
- `startDate`: Start date (defaults to today)
- `endDate`: End date (defaults to today)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "2024-01-15": [
      {
        "fullName": "User Name",
        "email": "user@example.com",
        "phoneNumber": "+1234567890",
        "state": "Delhi",
        "reportingManager": "Manager Name"
      },
      ...
    ],
    "2024-01-16": [...]
  }
}
```

---

### Get Users On Leave

**GET** `/api/attendance/onLeave`

Get list of users who are on leave today.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "fullName": "User Name",
      "email": "user@example.com",
      "phoneNumber": "+1234567890",
      "state": "Delhi",
      "reportingManager": "Manager Name"
    },
    ...
  ]
}
```

---

### Get User Visit Counts

**GET** `/api/attendance/siteCount?startDate=<date>&endDate=<date>`

Get site visit counts per user for a date range.

**Query Parameters:**
- `startDate`: Start date (optional, defaults to today)
- `endDate`: End date (optional, defaults to today)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "fullName": "User Name",
      "email": "user@example.com",
      "phoneNumber": "+1234567890",
      "state": "Delhi",
      "reportingManager": "Manager Name",
      "visitCount": 5
    },
    ...
  ]
}
```

---

### Get Users Without Attendance

**GET** `/api/attendance/absent?startDate=<date>&endDate=<date>`

Get users who haven't marked any attendance for the date range.

**Query Parameters:**
- `startDate`: Start date (optional, defaults to today)
- `endDate`: End date (optional, defaults to today)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "2024-01-15": [
      {
        "fullName": "User Name",
        "email": "user@example.com",
        "phoneNumber": "+1234567890",
        "state": "Delhi",
        "reportingManager": "Manager Name"
      },
      ...
    ]
  }
}
```

---

### Get User Dashboard Stats

**GET** `/api/attendance/dashboard-stats`

Get dashboard statistics for the authenticated user.

**Response (200 OK):**
```json
{
  "attendanceRate": "85.7%",
  "averageCheckIn": "09:30",
  "siteVisits": 45,
  "todayDistance": "25.5 km",
  "monthlyTotalDistance": "450.2 km",
  "currentDate": "2024-01-15",
  "trendData": {
    "attendanceChange": "+5.2%",
    "checkInStatus": "On Time",
    "siteVisitsPeriod": "This Month",
    "distanceStatus": "Today"
  }
}
```

---

### Get Admin Dashboard Stats

**GET** `/api/attendance/admin-dashboard-stats?state=<state>&startDate=<date>&endDate=<date>`

Get comprehensive statistics for admin dashboard.

**Query Parameters:**
- `state`: State filter (optional, use "all" for all states)
- `startDate`: Start date (optional, defaults to 30 days ago)
- `endDate`: End date (optional, defaults to today)

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "overview": {
      "totalUsers": 150,
      "activeUsers": 120,
      "inactiveUsers": 30,
      "totalAttendanceEntries": 3450,
      "checkIns": 1200,
      "checkOuts": 1150,
      "siteVisits": 1100,
      "totalDistanceCovered": "12500.50",
      "avgDistancePerUser": "104.17"
    },
    "stateWiseStats": {
      "Delhi": {
        "totalUsers": 50,
        "activeUsers": 45,
        "attendanceCount": 1200
      },
      ...
    },
    "topPerformers": [
      {
        "userId": "user_id",
        "fullName": "Top Performer",
        "email": "top@example.com",
        "state": "Delhi",
        "attendanceCount": 95,
        "siteVisits": 80
      },
      ...
    ],
    "dailyTrends": [
      {
        "date": "2024-01-15",
        "checkIns": 45,
        "checkOuts": 43,
        "siteVisits": 38,
        "activeUsers": 42
      },
      ...
    ],
    "recentActivity": [
      {
        "id": "attendance_id",
        "user": {
          "fullName": "User Name",
          "email": "user@example.com",
          "state": "Delhi"
        },
        "purpose": "Site Visit",
        "locationName": "123 Main St",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "date": "2024-01-15"
      },
      ...
    ]
  },
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-15"
  }
}
```

---

### Get User Movement Tracking

**GET** `/api/attendance/movement-tracking?userId=<id>&email=<email>&state=<state>&startDate=<date>&endDate=<date>`

Get detailed movement tracking for users.

**Query Parameters:**
- `userId`: Filter by user ID (optional)
- `email`: Filter by email (optional)
- `state`: Filter by state (optional, use "all" for all states)
- `startDate`: Start date (optional)
- `endDate`: End date (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "userInfo": {
        "id": "user_id",
        "email": "user@example.com",
        "fullName": "User Name",
        "phoneNumber": "+1234567890",
        "state": "Delhi",
        "reportingManager": "Manager Name"
      },
      "dailyMovements": [
        {
          "date": "2024-01-15",
          "movements": [
            {
              "id": "attendance_id",
              "timestamp": "2024-01-15T09:00:00.000Z",
              "purpose": "Check In",
              "location": {...},
              "locationName": "Office",
              "image": "..."
            },
            ...
          ],
          "totalDistance": 25.5,
          "pointToPointDistances": [...],
          "startLocation": {...},
          "endLocation": {...},
          "checkInTime": "2024-01-15T09:00:00.000Z",
          "checkOutTime": "2024-01-15T18:00:00.000Z",
          "siteVisits": 3
        },
        ...
      ]
    },
    ...
  ]
}
```

---

### Get Last Site Visit

**GET** `/api/attendance/last-site-visit`

Get the last site visit for the authenticated user today.

**Response (200 OK):**
```json
{
  "hasPreviousSiteVisit": true,
  "visitType": "Tower End",
  "attendanceId": "attendance_id",
  "summarySubmitted": false
}
```

**Response (No site visit):**
```json
{
  "hasPreviousSiteVisit": false
}
```

---

### Save Site Visit Summary

**POST** `/api/attendance/site-visit-summary`

Save a summary for a site visit.

**Request Body:**
```json
{
  "attendanceId": "attendance_id",
  "issue": "Router Faulty"
}
```

**Response (201 Created):**
```json
{
  "message": "Site visit summary saved successfully"
}
```

---

## Leave Management API

### Create Leave Request

**POST** `/api/leaves`

Create a new leave request.

**Request Body:**
```json
{
  "startDate": "2024-01-20",
  "endDate": "2024-01-22",
  "reason": "Personal work",
  "leaveType": "Casual Leave"
}
```

**Response (201 Created):**
```json
{
  "_id": "leave_id",
  "user": "user_id",
  "startDate": "2024-01-20T00:00:00.000Z",
  "endDate": "2024-01-22T00:00:00.000Z",
  "reason": "Personal work",
  "leaveType": "Casual Leave",
  "status": "Pending",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

---

### Get User Leaves

**GET** `/api/leaves`

Get all leave requests for the authenticated user.

**Response (200 OK):**
```json
[
  {
    "_id": "leave_id",
    "user": {
      "_id": "user_id",
      "fullName": "User Name",
      "email": "user@example.com"
    },
    "startDate": "2024-01-20T00:00:00.000Z",
    "endDate": "2024-01-22T00:00:00.000Z",
    "reason": "Personal work",
    "leaveType": "Casual Leave",
    "status": "Pending",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  ...
]
```

---

### Approve Leave

**PUT** `/api/leaves/:id/approve`

Approve a leave request. **State head only.**

**Response (200 OK):**
```json
{
  "message": "Leave approved successfully",
  "leave": {
    "_id": "leave_id",
    "status": "Approved",
    "approvedAt": "2024-01-15T10:30:00.000Z",
    "approver": "approver_user_id"
  }
}
```

---

### Reject Leave

**PUT** `/api/leaves/:id/reject`

Reject a leave request with reason. **State head only.**

**Request Body:**
```json
{
  "rejectionReason": "Insufficient leave balance"
}
```

**Response (200 OK):**
```json
{
  "message": "Leave rejected successfully",
  "leave": {
    "_id": "leave_id",
    "status": "Rejected",
    "rejectionReason": "Insufficient leave balance"
  }
}
```

---

### Get Pending Leaves

**GET** `/api/leaves/pending`

Get all pending leave requests for the state head's state.

**Response (200 OK):**
```json
[
  {
    "_id": "leave_id",
    "user": {
      "_id": "user_id",
      "fullName": "User Name",
      "email": "user@example.com",
      "state": "Delhi"
    },
    "startDate": "2024-01-20T00:00:00.000Z",
    "endDate": "2024-01-22T00:00:00.000Z",
    "reason": "Personal work",
    "leaveType": "Casual Leave",
    "status": "Pending",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  ...
]
```

---

## Site Allocation API

### Create/Update Site Allocation

**POST** `/api/site-allocation`

Create or update site allocation for a user.

**Request Body:**
```json
{
  "userId": "user_id",
  "sites": [
    {
      "siteName": "Site A",
      "district": "Central Delhi",
      "state": "Delhi"
    },
    {
      "siteName": "Site B",
      "district": "North Delhi",
      "state": "Delhi"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "_id": "allocation_id",
  "user": "user_id",
  "sites": [...],
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

---

### Get Site Allocation

**GET** `/api/site-allocation/:userId`

Get site allocation for a specific user.

**Response (200 OK):**
```json
{
  "_id": "allocation_id",
  "user": {
    "_id": "user_id",
    "fullName": "User Name",
    "email": "user@example.com"
  },
  "sites": [
    {
      "siteName": "Site A",
      "district": "Central Delhi",
      "state": "Delhi",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    ...
  ]
}
```

---

## User Targets API

### Create/Update Target

**POST** `/api/user-targets`

Create or update monthly target for a user.

**Request Body:**
```json
{
  "userId": "user_id",
  "month": "January",
  "year": 2024,
  "target": 100
}
```

**Response (201 Created):**
```json
{
  "message": "Target created/updated successfully",
  "target": {
    "_id": "target_id",
    "user": "user_id",
    "targets": [
      {
        "month": "January",
        "year": 2024,
        "target": 100,
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Get User Targets

**GET** `/api/user-targets/:userId`

Get all targets for a specific user.

**Response (200 OK):**
```json
{
  "_id": "target_id",
  "user": {
    "_id": "user_id",
    "fullName": "User Name"
  },
  "targets": [
    {
      "month": "January",
      "year": 2024,
      "target": 100,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    ...
  ]
}
```

---

## User Achievements API

### Create/Update Achievement

**POST** `/api/user-achievements`

Create or update monthly achievement for a user.

**Request Body:**
```json
{
  "userId": "user_id",
  "month": "January",
  "year": 2024,
  "achievement": 95
}
```

**Response (201 Created):**
```json
{
  "message": "Achievement created/updated successfully",
  "achievement": {
    "_id": "achievement_id",
    "user": "user_id",
    "achievements": [
      {
        "month": "January",
        "year": 2024,
        "achievement": 95,
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Get User Achievements

**GET** `/api/user-achievements/:userId`

Get all achievements for a specific user.

**Response (200 OK):**
```json
{
  "_id": "achievement_id",
  "user": {
    "_id": "user_id",
    "fullName": "User Name"
  },
  "achievements": [
    {
      "month": "January",
      "year": 2024,
      "achievement": 95,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    ...
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization token required"
}
```
or
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error message"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider implementing rate limiting for production use.

---

## Notes

- All dates should be in `YYYY-MM-DD` format
- Timestamps are returned in ISO 8601 format (UTC)
- Image uploads are compressed to under 10KB before storage
- Distance calculations use Google Maps Distance Matrix API
- Location names are resolved using Google Maps Geocoding API

