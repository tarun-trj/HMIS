# 📘 Pathologist API Documentation

This documentation provides an overview of the API functions related to equipment search and fetching patient details along with their test reports.

## 📁 Endpoints

### 1. 🔍 Search Equipment

**Endpoint:**  
`GET /api/pathologists/searchBy`

**Description:**  
Searches for hospital equipment either by its **ID** or **name** (case-insensitive partial match).

**Query Parameters:**

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| searchBy  | string | ✅ Yes   | Equipment ID or name (partial OK) |

**Example Requests:**

- `/api/equipment/search?searchBy=CT Scanner`
- `/api/equipment/search?searchBy=10008`

**Success Response:**

```json
[
  {
    "_id": 10008,
    "equipment_name": "CT Scanner",
    "quantity": 1,
    "last_service_date": "2023-01-03T12:13:56.941Z"
  },
  ...
]
```

**Failure Response:**

- `400 Bad Request`: If `searchBy` is missing.
- `500 Internal Server Error`: On server failure.

---

### 2. 🧪 Search Patient Info and Test Reports

**Endpoint:**  
`GET /api/pathologists/searchById`

**Description:**  
Fetches basic patient information along with the list of tests (from the most recent consultation).

**Query Parameters:**

| Parameter  | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| searchById | number | ✅ Yes   | Patient ID (numeric) |

**Example Request:**

- `/api/pathologists/searchById?searchById=10013`

**Success Response:**

```json
{
  "patient": {
    "_id": 10013,
    "name": "Julius Lemke",
    "phone_number": "1-304-271-7557 x414",
    "patient_info": {
      "age": 54,
      "bloodGrp": "A-"
    }
  },
  "tests": [
    {
      "title": "blood test",
      "status": "pending"
    }
  ]
}
```

**Failure Response:**

- `400 Bad Request`: If `searchById` is missing or invalid.
- `404 Not Found`: If patient or consultation not found.
- `500 Internal Server Error`: On server failure.

---

### 3. 📋 Get Pending Tests for a Patient

**Endpoint:**  
`GET /api/pathologists/pendingTests/:patientId`

**Description:**  
Returns a list of all pending tests from the most recent consultation for a specific patient.

**Route Parameters:**

| Parameter  | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| patientId  | number | ✅ Yes   | Patient ID (numeric) |

**Example Request:**
- `/api/pathologists/pendingTests/10013`

**Success Response:**
```json
{
  "patientName": "Julius Lemke",
  "patientId": 10013,
  "pendingTests": [
    {
      "_id": "testReportId1",
      "title": "X-Ray",
      "description": "Chest X-Ray to check for infection"
    },
    {
      "_id": "testReportId2",
      "title": "blood test",
      "description": "Complete Blood Count"
    }
  ]
}
```

**Failure Responses:**
- `400 Bad Request`: If `patientId` is missing or invalid.
- `404 Not Found`: If patient or pending tests not found.
- `500 Internal Server Error`: On server failure.

---

### 4. ⬆️ Upload Test Result File

**Endpoint:**  
`POST /api/pathologists/uploadTestResults`

**Description:**  
Uploads a test result file for a specific report under a patient's consultation.

**Request Body Parameters (form-data):**

| Parameter       | Type   | Required | Description                         |
| --------------- | ------ | -------- | ----------------------------------- |
| patientId       | string | ✅ Yes   | ID of the patient                   |
| consultationId  | string | ✅ Yes   | ID of the consultation              |
| testId          | string | ✅ Yes   | ID of the test report               |
| testResultFile  | File   | ✅ Yes   | File containing the test result     |

**Supported File Types:**
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Images (.jpg, .jpeg, .png)

**File Size Limit:** 10MB

**Example (form-data):**
```
patientId = 10013  
consultationId = 6619db0a9438dacc18c142c2  
testId = 6619db0a9438dacc18c142c5  
testResultFile = [attach a PDF file]
```

**Success Response:**
```json
{
  "message": "Test results uploaded successfully.",
  "updatedReport": {
    "_id": "6619db0a9438dacc18c142c5",
    "title": "blood test",
    "status": "completed",
    "reportText": "uploads/test-results/test-1681578012456-123456789.pdf",
    "updatedAt": "2025-04-15T14:20:12.456Z"
  }
}
```

**Failure Responses:**
- `400 Bad Request`: Missing fields, test not pending, or unsupported file format.
- `404 Not Found`: Patient or consultation or test not found.
- `500 Internal Server Error`: On server failure.

---

## ⚙️ Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- Multer (for file uploads)

---

## 📁 Folder Structure (Relevant)
```bash
/models
  └── equipment.js
  └── consultation.js
  └── patient.js

/controllers
  └── pathologist.controller.js

/routes
  └── pathologist.routes.js

/uploads
  └── test-results
      └── (Test result files are saved here)
```

---

## 🛠️ Developer Notes

- `Consultation.reports` is an embedded array storing test details.
- Most recent consultation is fetched using `.sort({ actual_start_datetime: -1 })`.
- Case-insensitive regex is used for equipment name match.
- File uploads are saved in the "uploads/test-results" directory.
- The file name is generated with a timestamp and random number for uniqueness.
- Only reports with status `pending` are allowed to be updated.
- File uploads are limited to 10MB in size.
