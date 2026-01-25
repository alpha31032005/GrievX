# API Documentation

## Overview

The Smart Civic Issue Reporting and Analytics System provides a RESTful API for managing civic complaints, user authentication, and analytics. The system consists of three main services:

- **Backend Service**: Node.js/Express server handling authentication, complaints, and analytics
- **ML Service**: Python FastAPI service for image and text classification
- **Frontend**: React application consuming the APIs

## Base URLs

- Backend API: `http://localhost:5000/api`
- ML Service: `http://localhost:8000`

## Authentication

The system uses JWT (JSON Web Token) authentication. Include the token in the Authorization header for protected routes:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **Citizen**: Can create and view their own complaints
- **Admin**: Department-specific administrator who can manage complaints in their assigned department
- **Chief**: Super administrator with access to all departments and system-wide analytics

## API Endpoints

### Authentication Routes

#### Register User

Creates a new citizen account.

**Endpoint**: `POST /api/auth/register`

**Access**: Public

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen",
    "phone": "1234567890"
  }
}
```

**Validation Rules**:
- Name: Minimum 3 characters
- Email: Valid email format
- Password: Minimum 6 characters

#### Login

Authenticates users (citizens, admins, or chief).

**Endpoint**: `POST /api/auth/login`

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "role": "citizen",
    "name": "John Doe",
    "department": null
  }
}
```

**Admin Credentials**: 
- Garbage Admin: `garbage.admin@civic.com` / `garbage123`
- Potholes Admin: `potholes.admin@civic.com` / `potholes123`
- Electric Poles Admin: `electric.admin@civic.com` / `electric123`
- Fallen Trees Admin: `trees.admin@civic.com` / `trees123`

**Chief Credentials**: `chief@civic.com` / `chief123`

#### Get Profile

Retrieves the authenticated user's profile.

**Endpoint**: `GET /api/auth/profile`

**Access**: Protected (All roles)

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "65f1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen",
    "phone": "1234567890",
    "ward": null,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Profile

Updates the authenticated user's profile information.

**Endpoint**: `PUT /api/auth/profile`

**Access**: Protected (All roles)

**Request Body**:
```json
{
  "name": "John Smith",
  "phone": "9876543210",
  "ward": 5
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "65f1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "9876543210",
    "ward": 5
  }
}
```

### Complaint Routes

#### Create Complaint (Simple)

Creates a new complaint with optional image upload using FormData.

**Endpoint**: `POST /api/complaints`

**Access**: Protected (Citizens)

**Content-Type**: `multipart/form-data`

**Request Body**:
```
description: "Broken streetlight near main road"
location: "Corner of 5th Avenue and Main Street"
category: "electric_poles"
image: <file>
```

**Response**:
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "id": "65f1b2c3d4e5f6g7h8i9j0k1",
    "category": "electric_poles",
    "department": "electric_poles",
    "status": "open"
  }
}
```

#### Create Complaint (Detailed)

Creates a new complaint with full details and validation.

**Endpoint**: `POST /api/complaints/create`

**Access**: Protected (Citizens)

**Request Body**:
```json
{
  "title": "Broken streetlight on Main Street",
  "description": "The streetlight has been non-functional for 3 days",
  "ward": 5,
  "category": "electric_poles",
  "severity": "high",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response**:
```json
{
  "success": true,
  "complaint": {
    "id": "65f1b2c3d4e5f6g7h8i9j0k1",
    "userId": "65f1b2c3d4e5f6g7h8i9j0k0",
    "title": "Broken streetlight on Main Street",
    "description": "The streetlight has been non-functional for 3 days",
    "ward": 5,
    "category": "electric_poles",
    "department": "electric_poles",
    "severity": "high",
    "status": "open",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716]
    },
    "categoryConfidence": 0.95,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Categories**: `garbage`, `potholes`, `fallen_trees`, `electric_poles`, `misc`

**Severity Levels**: `low`, `medium`, `high`, `critical`

#### Get My Complaints

Retrieves all complaints created by the authenticated citizen.

**Endpoint**: `GET /api/complaints/my` or `GET /api/complaints/user/me`

**Access**: Protected (Citizens)

**Query Parameters**:
- `status` (optional): Filter by status (open, in_progress, resolved, rejected)
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "complaints": [
    {
      "id": "65f1b2c3d4e5f6g7h8i9j0k1",
      "title": "Broken streetlight",
      "description": "The streetlight has been non-functional",
      "category": "electric_poles",
      "status": "in_progress",
      "severity": "high",
      "ward": 5,
      "upvotes": 3,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T14:20:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalComplaints": 25,
    "hasMore": true
  }
}
```

#### Get All Complaints

Retrieves all complaints (filtered by department for admins).

**Endpoint**: `GET /api/complaints/all`

**Access**: Protected (Admin, Chief)

**Query Parameters**:
- `status` (optional): Filter by status
- `category` (optional): Filter by category
- `department` (optional): Filter by department (Chief only)
- `ward` (optional): Filter by ward
- `severity` (optional): Filter by severity
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response**:
```json
{
  "success": true,
  "complaints": [
    {
      "id": "65f1b2c3d4e5f6g7h8i9j0k1",
      "userId": {
        "id": "65f1b2c3d4e5f6g7h8i9j0k0",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "title": "Broken streetlight",
      "description": "The streetlight has been non-functional",
      "category": "electric_poles",
      "department": "electric_poles",
      "status": "open",
      "severity": "high",
      "ward": 5,
      "upvotes": 3,
      "assignedTo": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 45
}
```

#### Get Single Complaint

Retrieves details of a specific complaint.

**Endpoint**: `GET /api/complaints/:id`

**Access**: Protected (All roles)

**Response**:
```json
{
  "success": true,
  "complaint": {
    "id": "65f1b2c3d4e5f6g7h8i9j0k1",
    "userId": {
      "id": "65f1b2c3d4e5f6g7h8i9j0k0",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    "title": "Broken streetlight on Main Street",
    "description": "The streetlight has been non-functional for 3 days",
    "category": "electric_poles",
    "department": "electric_poles",
    "status": "in_progress",
    "severity": "high",
    "ward": 5,
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716]
    },
    "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "upvotes": 5,
    "assignedTo": "John Smith",
    "statusHistory": [
      {
        "status": "open",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "updatedBy": "system"
      },
      {
        "status": "in_progress",
        "timestamp": "2024-01-16T09:15:00.000Z",
        "updatedBy": "electric.admin@civic.com"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T09:15:00.000Z"
  }
}
```

#### Update Complaint Status

Updates the status of a complaint.

**Endpoint**: `PUT /api/complaints/:id/status`

**Access**: Protected (Admin, Chief)

**Request Body**:
```json
{
  "status": "in_progress",
  "remarks": "Work has been initiated"
}
```

**Status Values**: `open`, `in_progress`, `resolved`, `rejected`

**Response**:
```json
{
  "success": true,
  "complaint": {
    "id": "65f1b2c3d4e5f6g7h8i9j0k1",
    "status": "in_progress",
    "statusHistory": [
      {
        "status": "in_progress",
        "timestamp": "2024-01-16T09:15:00.000Z",
        "updatedBy": "electric.admin@civic.com",
        "remarks": "Work has been initiated"
      }
    ]
  }
}
```

#### Assign Complaint

Assigns a complaint to a specific person or team.

**Endpoint**: `PUT /api/complaints/:id/assign`

**Access**: Protected (Admin, Chief)

**Request Body**:
```json
{
  "assignedTo": "Maintenance Team A"
}
```

**Response**:
```json
{
  "success": true,
  "complaint": {
    "id": "65f1b2c3d4e5f6g7h8i9j0k1",
    "assignedTo": "Maintenance Team A",
    "updatedAt": "2024-01-16T10:00:00.000Z"
  }
}
```

#### Upvote Complaint

Adds an upvote to a complaint to increase its priority.

**Endpoint**: `PUT /api/complaints/:id/upvote`

**Access**: Protected (All roles)

**Response**:
```json
{
  "success": true,
  "complaint": {
    "id": "65f1b2c3d4e5f6g7h8i9j0k1",
    "upvotes": 6
  }
}
```

### Analytics Routes

All analytics endpoints are role-filtered: Admins see only their department data, Chief sees all departments.

#### Get Overview

Provides high-level statistics and overview metrics.

**Endpoint**: `GET /api/analytics/overview`

**Access**: Protected (Admin, Chief)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalComplaints": 245,
    "openComplaints": 45,
    "inProgressComplaints": 30,
    "resolvedComplaints": 150,
    "rejectedComplaints": 20,
    "averageResolutionTime": 4.5,
    "resolutionRate": 61.2,
    "topCategory": "garbage",
    "topWard": 5
  }
}
```

#### Get Monthly Trends

Returns complaint trends over the past months.

**Endpoint**: `GET /api/analytics/monthly`

**Access**: Protected (Admin, Chief)

**Query Parameters**:
- `months` (optional): Number of months to retrieve (default: 6)

**Response**:
```json
{
  "success": true,
  "data": {
    "monthly": [
      {
        "month": "2024-01",
        "total": 45,
        "open": 10,
        "in_progress": 15,
        "resolved": 18,
        "rejected": 2
      },
      {
        "month": "2024-02",
        "total": 52,
        "open": 12,
        "in_progress": 18,
        "resolved": 20,
        "rejected": 2
      }
    ]
  }
}
```

#### Get Category Analytics

Returns complaint distribution by category.

**Endpoint**: `GET /api/analytics/category`

**Access**: Protected (Admin, Chief)

**Response**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "garbage",
        "count": 85,
        "percentage": 34.7,
        "resolved": 55,
        "pending": 30
      },
      {
        "category": "potholes",
        "count": 62,
        "percentage": 25.3,
        "resolved": 40,
        "pending": 22
      },
      {
        "category": "electric_poles",
        "count": 48,
        "percentage": 19.6,
        "resolved": 30,
        "pending": 18
      }
    ]
  }
}
```

#### Get Resolution Time Analytics

Returns average resolution times by category and status.

**Endpoint**: `GET /api/analytics/resolution`

**Access**: Protected (Admin, Chief)

**Response**:
```json
{
  "success": true,
  "data": {
    "overall": {
      "averageHours": 108.5,
      "averageDays": 4.5
    },
    "byCategory": [
      {
        "category": "garbage",
        "averageHours": 72,
        "averageDays": 3
      },
      {
        "category": "potholes",
        "averageHours": 120,
        "averageDays": 5
      }
    ]
  }
}
```

#### Get Map Data

Returns complaint locations for map visualization.

**Endpoint**: `GET /api/analytics/map`

**Access**: Protected (Admin, Chief)

**Query Parameters**:
- `status` (optional): Filter by status
- `category` (optional): Filter by category

**Response**:
```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "id": "65f1b2c3d4e5f6g7h8i9j0k1",
        "title": "Broken streetlight",
        "category": "electric_poles",
        "status": "open",
        "severity": "high",
        "location": {
          "type": "Point",
          "coordinates": [77.5946, 12.9716]
        },
        "ward": 5,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

#### Get Activity Timeline

Returns recent activity and updates on complaints.

**Endpoint**: `GET /api/analytics/activity`

**Access**: Protected (Admin, Chief)

**Query Parameters**:
- `days` (optional): Number of days to retrieve (default: 7)

**Response**:
```json
{
  "success": true,
  "data": {
    "activity": [
      {
        "date": "2024-01-16",
        "created": 12,
        "updated": 8,
        "resolved": 5
      },
      {
        "date": "2024-01-15",
        "created": 15,
        "updated": 10,
        "resolved": 7
      }
    ]
  }
}
```

#### Get System Statistics

Returns system-wide statistics and performance metrics.

**Endpoint**: `GET /api/analytics/system`

**Access**: Protected (Admin, Chief)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeUsers": 890,
    "totalComplaints": 245,
    "mlClassifications": 230,
    "mlAccuracy": 93.5,
    "systemUptime": "15 days",
    "averageResponseTime": "250ms"
  }
}
```

#### Get Ward Heatmap

Returns complaint density by ward for heatmap visualization.

**Endpoint**: `GET /api/analytics/heatmap`

**Access**: Protected (Admin, Chief)

**Response**:
```json
{
  "success": true,
  "data": {
    "wards": [
      { "ward": 1, "count": 25 },
      { "ward": 2, "count": 18 },
      { "ward": 3, "count": 32 },
      { "ward": 4, "count": 15 },
      { "ward": 5, "count": 40 }
    ]
  }
}
```

#### Get My Activity (Citizen)

Returns activity statistics for the authenticated citizen.

**Endpoint**: `GET /api/analytics/my-activity`

**Access**: Protected (Citizens)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalComplaints": 8,
    "openComplaints": 2,
    "resolvedComplaints": 5,
    "rejectedComplaints": 1,
    "averageResolutionTime": 3.5,
    "mostReportedCategory": "garbage"
  }
}
```

### ML Service Routes

The ML Service provides text and image classification capabilities.

#### Classify Text

Classifies text description into a complaint category.

**Endpoint**: `POST /api/ml/classify/text`

**Access**: Internal (called by backend)

**Request Body**:
```json
{
  "text": "There is a broken streetlight near the main intersection"
}
```

**Response**:
```json
{
  "success": true,
  "category": "electric_poles",
  "confidence": 0.95,
  "predictions": [
    { "category": "electric_poles", "confidence": 0.95 },
    { "category": "misc", "confidence": 0.03 },
    { "category": "garbage", "confidence": 0.02 }
  ]
}
```

#### Classify Image

Classifies an image into a complaint category.

**Endpoint**: `POST /api/ml/classify/image`

**Access**: Internal (called by backend)

**Request Body**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response**:
```json
{
  "success": true,
  "category": "potholes",
  "confidence": 0.89,
  "predictions": [
    { "category": "potholes", "confidence": 0.89 },
    { "category": "fallen_trees", "confidence": 0.06 },
    { "category": "garbage", "confidence": 0.05 }
  ]
}
```

#### Health Check

Checks the health status of the ML service.

**Endpoint**: `GET /health` or `GET /api/ml/health`

**Access**: Public

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-16T10:30:00.000Z",
  "models": {
    "text_classifier": "loaded",
    "image_classifier": "loaded",
    "embedder": "loaded"
  }
}
```

## Error Responses

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User lacks permission for the requested action
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Rate Limiting

Currently, the API does not implement rate limiting. This feature may be added in future versions for production deployments.

## Data Validation

Request data is validated using Joi schemas. Common validation rules:

- **Email**: Must be a valid email format
- **Password**: Minimum 6 characters
- **Name**: Minimum 3 characters
- **Title**: Maximum 200 characters
- **Description**: Maximum 2000 characters
- **Ward**: Must be a positive integer
- **Category**: Must be one of the predefined categories
- **Severity**: Must be one of: low, medium, high, critical
- **Status**: Must be one of: open, in_progress, resolved, rejected

## File Upload Guidelines

- **Supported Formats**: JPEG, PNG, GIF
- **Maximum Size**: 10MB per file
- **Encoding**: Base64 for storage in database
- **Mime Types**: Validated on upload

## Best Practices

1. Always include the JWT token in the Authorization header for protected routes
2. Handle errors gracefully and display user-friendly messages
3. Use appropriate HTTP methods (GET for retrieval, POST for creation, PUT for updates)
4. Validate data on the client side before sending requests
5. Use pagination for large datasets
6. Cache responses when appropriate to reduce server load
7. Implement retry logic for failed requests
8. Log errors and monitor API performance

## Support and Contact

For API-related issues or questions, please refer to the USER_MANUAL.md or contact the development team.