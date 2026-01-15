# 🌆 Smart Civic Backend API

Complete Node.js backend for Smart Civic Issue Reporting & Analytics System.

## 📦 Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
```

## 🚀 Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:5000`

---

## 📋 API Documentation

### 🔐 **Authentication Endpoints**

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "citizen" // or "admin", "officer"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+91-9999999999"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### 📝 **Complaint Endpoints**

#### Create Complaint (Citizen)
```
POST /api/complaints/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Pothole on Main Street",
  "description": "Large pothole outside market area",
  "ward": 1,
  "category": "pothole", // garbage, pothole, fallen_trees, electric_poles
  "severity": "high", // low, medium, high, critical
  "latitude": 19.0760,
  "longitude": 72.8777,
  "imageUrl": "https://..."
}

Response:
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": { ... }
}
```

#### Get My Complaints (Citizen)
```
GET /api/complaints/my?page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "complaints": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Get All Complaints (Admin/Officer)
```
GET /api/complaints/all?status=open&category=pothole&ward=1&page=1&limit=10
Authorization: Bearer <token>
Role: admin or officer

Response: Same as above
```

#### Get Single Complaint
```
GET /api/complaints/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "complaint": { ... }
}
```

#### Update Complaint Status (Admin/Officer)
```
PUT /api/complaints/:id/status
Authorization: Bearer <token>
Role: admin or officer
Content-Type: application/json

{
  "status": "resolved", // open, in_progress, resolved, closed
  "resolution": "Pothole filled and road repaired"
}

Response:
{
  "success": true,
  "message": "Complaint status updated",
  "complaint": { ... }
}
```

#### Assign Complaint (Admin/Officer)
```
PUT /api/complaints/:id/assign
Authorization: Bearer <token>
Role: admin or officer
Content-Type: application/json

{
  "officerId": "60d5ec49c1234a001f9c4a1b"
}

Response:
{
  "success": true,
  "message": "Complaint assigned successfully",
  "complaint": { ... }
}
```

#### Upvote Complaint
```
PUT /api/complaints/:id/upvote
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Complaint upvoted",
  "complaint": { ... }
}
```

---

### 📊 **Analytics Endpoints** (Admin Only)

#### Get Ward Heatmap Data
```
GET /api/analytics/heatmap?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
Role: admin

Response:
{
  "success": true,
  "heatmapData": [
    {
      "ward": 1,
      "complaintCount": 45,
      "severity": 2.3,
      "categories": ["pothole", "garbage"]
    },
    ...
  ]
}
```

#### Get Category Trends
```
GET /api/analytics/category-trends?months=6
Authorization: Bearer <token>
Role: admin

Response:
{
  "success": true,
  "trends": {
    "pothole": [
      { "month": "2024-12", "count": 15 },
      { "month": "2024-11", "count": 12 }
    ],
    "garbage": [ ... ],
    ...
  }
}
```

#### Get Statistics
```
GET /api/analytics/statistics
Authorization: Bearer <token>
Role: admin

Response:
{
  "success": true,
  "statistics": {
    "totalComplaints": [ { "count": 150 } ],
    "byCategory": [
      { "_id": "pothole", "count": 45 },
      ...
    ],
    "byStatus": [ ... ],
    "bySeverity": [ ... ],
    "averageResolutionTime": [ ... ]
  }
}
```

#### Get Top Wards
```
GET /api/analytics/top-wards?limit=10
Authorization: Bearer <token>
Role: admin

Response:
{
  "success": true,
  "topWards": [
    {
      "ward": 1,
      "complaintCount": 45,
      "resolvedCount": 30,
      "resolutionRate": 66.67
    },
    ...
  ]
}
```

#### Get Category Distribution by Ward
```
GET /api/analytics/category-by-ward/:ward
Authorization: Bearer <token>
Role: admin

Response:
{
  "success": true,
  "ward": 1,
  "data": [
    { "_id": "pothole", "count": 20 },
    { "_id": "garbage", "count": 15 },
    ...
  ]
}
```

---

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (citizen/admin/officer),
  ward: Number,
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Complaint Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  ward: Number,
  title: String,
  description: String,
  category: String (garbage/pothole/fallen_trees/electric_poles),
  categoryConfidence: Number (0-1),
  severity: String (low/medium/high/critical),
  imageUrl: String,
  imageMLPrediction: String,
  imageMLConfidence: Number,
  location: {
    type: Point,
    coordinates: [longitude, latitude]
  },
  status: String (open/in_progress/resolved/closed),
  assignedTo: ObjectId (ref: User),
  resolution: String,
  resolutionDate: Date,
  upvotes: Number,
  comments: Array,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 ML Service Integration

The backend integrates with Python FastAPI ML service:

- **Text Classification**: `/ml/classify_text` - Classifies complaint text
- **Image Classification**: `/ml/classify_image` - Classifies complaint images

Both are called automatically during complaint creation.

---

## 🛡️ Security Features

✅ JWT Authentication
✅ Password Hashing (bcryptjs)
✅ Role-Based Access Control (RBAC)
✅ Input Validation (Joi)
✅ CORS Protection
✅ Error Handling & Logging

---

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jwt**: Authentication
- **bcryptjs**: Password hashing
- **axios**: HTTP client (for ML service)
- **joi**: Input validation
- **morgan**: Request logging
- **winston**: Application logging
- **cors**: CORS middleware
- **dotenv**: Environment variables

---

## 🚀 Deployment

### Docker (Optional)
Create `Dockerfile` and `.dockerignore` for containerization.

### Environment Variables
Update `.env` file for production with:
- Real MongoDB URI
- Strong JWT Secret
- Production ML Service URL
- Correct CORS origins

---

## 📞 Support

For issues or questions, contact the development team.

---

**Made with ❤️ for Smart Cities**
