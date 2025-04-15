# 📘 Nurse API Documentation

This documentation provides an overview of the API functions related to searching for patient information and managing patient vitals available to nurses.

---

## 📁 Endpoints

### 1. 🔍 Search Patient Information

**Endpoint:**  
`GET /api/nurses/searchQuery`

**Description:**  
Searches for patients using their **ID**, **phone number** (exact match), or **name** (case-insensitive partial match). Returns basic patient information along with their current status.

**Query Parameters:**

| Parameter   | Type   | Required | Description                                   |
| ----------- | ------ | -------- | --------------------------------------------- |
| searchQuery | string | ✅ Yes   | Patient ID, phone number, or name (partial OK) |

**Example Requests:**

- `/api/nurses/searchQuery?searchQuery=John`
- `/api/nurses/searchQuery?searchQuery=10013`
- `/api/nurses/searchQuery?searchQuery=1234567890`

**Success Response:**
```json
[
  {
    "_id": 10013,
    "name": "John Smith",
    "phone_number": "1234567890",
    "status": "Admitted",
    "roomNo": "301"
  },
  {
    "_id": 10018,
    "name": "John Doe",
    "phone_number": "9876543210",
    "status": "Critical",
    "roomNo": "ICU-5"
  }
]
```

**Patient Status Logic:**
- `"Critical"`: If latest vitals show blood pressure > 180 or body temperature > 104°F
- `"Admitted"`: If patient has a room number assigned
- `"Discharged"`: If patient has no room number assigned

**Failure Responses:**

- `400 Bad Request`: If `searchQuery` is missing.
- `500 Internal Server Error`: On server failure.

---

### 2. 📊 Add Patient Vitals

**Endpoint:**  
`POST /api/nurses/patients/:patientId/vitals`

**Description:**  
Records new vital signs for a specific patient.

**URL Parameters:**

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| patientId | number | ✅ Yes   | Patient ID number |

**Request Body:**

| Field          | Type   | Required | Description                            |
| -------------- | ------ | -------- | -------------------------------------- |
| bloodPressure  | number | ✅ Yes   | Systolic blood pressure reading        |
| bodyTemp       | number | ✅ Yes   | Body temperature (in Fahrenheit)       |
| pulseRate      | number | ✅ Yes   | Pulse rate (beats per minute)          |
| breathingRate  | number | ✅ Yes   | Respiratory rate (breaths per minute)  |

**Example Request:**
```json
{
  "bloodPressure": 120,
  "bodyTemp": 98.6,
  "pulseRate": 72,
  "breathingRate": 16
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Vitals recorded successfully",
  "data": {
    "date": "April 15, 2025",
    "time": "02:30 PM",
    "bloodPressure": 120,
    "bodyTemp": 98.6,
    "pulseRate": 72,
    "breathingRate": 16
  }
}
```

**Failure Responses:**
- `404 Not Found`: If patient with the given ID does not exist.
- `500 Internal Server Error`: On server failure.

---

### 3. 🔄 Update Patient Vitals

**Endpoint:**  
`PUT /api/nurses/patients/:patientId/vitals/:vitalId`

**Description:**  
Updates an existing vital signs record for a specific patient.

**URL Parameters:**

| Parameter | Type   | Required | Description                |
| --------- | ------ | -------- | -------------------------- |
| patientId | number | ✅ Yes   | Patient ID number          |
| vitalId   | string | ✅ Yes   | ID of the vital sign record |

**Request Body:**

| Field          | Type   | Required | Description                            |
| -------------- | ------ | -------- | -------------------------------------- |
| bloodPressure  | number | ❌ No    | Systolic blood pressure reading        |
| bodyTemp       | number | ❌ No    | Body temperature (in Fahrenheit)       |
| pulseRate      | number | ❌ No    | Pulse rate (beats per minute)          |
| breathingRate  | number | ❌ No    | Respiratory rate (breaths per minute)  |

**Example Request:**
```json
{
  "bloodPressure": 130,
  "bodyTemp": 99.2
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Vitals updated successfully",
  "data": {
    "date": "April 15, 2025",
    "time": "03:45 PM",
    "bloodPressure": 130,
    "bodyTemp": 99.2,
    "pulseRate": 72,
    "breathingRate": 16
  }
}
```

**Notes:**
- Only fields that need to be updated should be included in the request.
- Date and time will be automatically updated to the current date and time (Indian Standard Time).

**Failure Responses:**
- `404 Not Found`: If patient or specific vital record does not exist.
- `500 Internal Server Error`: On server failure.

---

## ⚙️ Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose

---

## 📁 Folder Structure (Relevant)
```bash
/models
  └── patient.js

/controllers
  └── nurse.controller.js

/routes
  └── nurse.routes.js

/middleware
  └── authMiddleware.js
```

---

## 🛠️ Developer Notes

- Phone number search requires an exact 10-digit match
- Patient ID search works with any numeric-only input
- Name search uses case-insensitive regex pattern matching
- Status is determined dynamically based on room assignment and vital signs
- Only necessary patient fields are selected from the database to optimize response size
- All routes are protected with authentication middleware
- Date and time are formatted according to Indian Standard Time (IST/Asia-Kolkata)
- Vital records are stored as a subdocument array within the patient document
- The system automatically detects critical patients based on vitals thresholds
