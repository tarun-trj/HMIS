# PatientInfo Component Documentation

## Overview

The `PatientInfo` component is a React functional component that allows users to fetch and display patient details along with either prescribed tests or medicines based on the role (`pathologist` or `pharmacist`) inferred from the URL path.

## Features

- Role-based data fetching and rendering
- Conditional rendering for patient details, prescribed tests, or medicines
- User input for Patient ID

## File: `PatientInfo.jsx`

### Imports

```jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
```

### State Variables

- `inputValue`: Stores the patient ID input by the user.
- `patientId`: Stores the trimmed patient ID after user submits it.
- `patientDetails`: Stores the patient’s details fetched from mock DB.
- `tests`: Stores the list of prescribed tests.
- `medicines`: Stores the list of prescribed medicines.
- `loading`: Indicates the data fetch state.

### Role Detection

The role is extracted from the pathname (URL path) using `useLocation()` and is expected to be either `pathologist` or `pharmacist`.

### Data Fetching Functions

- `fetchPrescribedTests(patientId)`: Simulates fetching test data for a patient.
- `fetchPrescribedMedicines(patientId)`: Simulates fetching medicine data for a patient.

### `useEffect` Hook

Triggered when `patientId` or `role` changes. Based on the role, it calls the respective data fetch function and updates the component state.

### Rendering

- Input box for entering Patient ID.
- Patient Details section (Always rendered).
- Prescribed Tests table (Only for pathologist).
- Prescribed Medicines table (Only for pharmacist).
- Loading indication shown while data is being fetched.

## Conditional Styling

Color codes indicate prescription/test statuses:

- **Red**: Pending / Not Dispensed
- **Green**: Fully Dispensed
- **Yellow**: Partially Dispensed

## Usage

Ensure that this component is used within a route like `/pathologist` or `/pharmacist`, so that the `role` can be correctly determined.

## Example Routes

- `/pathologist/patient-info` - Shows prescribed tests.
- `/pharmacist/patient-info` - Shows prescribed medicines.
