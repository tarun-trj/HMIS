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

## ⚙️ Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB with Mongoose**

## 📁 Folder Structure (Relevant)

```
/models
  └── equipment.js
  └── consultation.js
  └── patient.js

/controllers
  └── pathologist.controller.js
  └── pathologist.controller.md (this file)

```

## 🛠️ Developer Notes

- `Consultation.reports` is an **embedded array** storing test details.
- This API fetches the most recent consultation using `.sort({ actual_start_datetime: -1 })`.
- Equipment name matches use case-insensitive regex for flexibility.

---
