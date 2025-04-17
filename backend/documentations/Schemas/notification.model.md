# Mongoose Schema Documentation: Notification System

## Notification Schema

The `Notification` schema represents system or user-generated messages with scheduling capabilities.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `senderEmail` | String | Email address of the notification sender | None |
| `receiverEmail` | String | Email address of the notification recipient | None |
| `content` | String | Body text of the notification | None |
| `date` | Date | Date associated with the notification | None |
| `time` | String | Time component in string format | None |
| `future` | Boolean | Whether this is a future scheduled notification | None |
| `recurring` | Boolean | Whether this notification repeats on a schedule | None |
| `frequency` | String | How often a recurring notification repeats | None |
| `futureSchedules` | Array | List of future notification occurrences | Embedded futureSchedules items |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Future Schedule Entry Fields (Subdocument)

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `scheduledDateTime` | Date | When the notification should be sent | None |
| `priority` | Number | Importance level of the notification | Default: 0 |
| `status` | String | Current delivery status | Enum: "pending", "sent", "failed", Default: "pending" |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields

## Model
- `Notification`: Mongoose model for notifications

## Usage Examples

```javascript
// Creating an immediate notification
const immediateNotification = new Notification({
  senderEmail: "system@hospital.com",
  receiverEmail: "doctor@hospital.com",
  content: "New patient admitted to emergency ward",
  date: new Date(),
  time: "14:30",
  future: false,
  recurring: false
});

await immediateNotification.save();

// Creating a future scheduled notification
const appointmentReminder = new Notification({
  senderEmail: "appointments@hospital.com",
  receiverEmail: "patient@example.com",
  content: "Reminder: You have an appointment tomorrow at 10:00 AM",
  date: new Date(),
  time: "09:00",
  future: true,
  recurring: false,
  futureSchedules: [
    {
      scheduledDateTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      priority: 2
    }
  ]
});

await appointmentReminder.save();

// Creating a recurring notification
const medicationReminder = new Notification({
  senderEmail: "reminders@hospital.com",
  receiverEmail: "patient@example.com",
  content: "Time to take your medication",
  date: new Date(),
  time: "08:00",
  future: true,
  recurring: true,
  frequency: "daily",
  futureSchedules: [
    {
      scheduledDateTime: new Date(new Date().setHours(8, 0, 0, 0)),
      priority: 3
    },
    {
      scheduledDateTime: new Date(new Date().setHours(8, 0, 0, 0) + 24 * 60 * 60 * 1000),
      priority: 3
    },
    {
      scheduledDateTime: new Date(new Date().setHours(8, 0, 0, 0) + 2 * 24 * 60 * 60 * 1000),
      priority: 3
    }
  ]
});

await medicationReminder.save();

// Finding pending notifications to be sent
const now = new Date();
const pendingNotifications = await Notification.find({
  "futureSchedules": {
    $elemMatch: {
      "scheduledDateTime": { $lte: now },
      "status": "pending"
    }
  }
});

// Updating notification status after sending
await Notification.updateOne(
  { 
    _id: notificationId,
    "futureSchedules.scheduledDateTime": scheduledTime
  },
  { $set: { "futureSchedules.$.status": "sent" }}
);

// Finding all notifications for a specific recipient
const userNotifications = await Notification.find({
  receiverEmail: "patient@example.com"
}).sort({ createdAt: -1 });
```

## Notes
- The notification system supports both immediate and scheduled messages
- Recurring notifications can be set up with multiple future occurrences
- Each future notification instance tracks its delivery status
- The priority field can be used to sort notifications by importance
- The schema separates the date and time fields while also storing the combined value in scheduledDateTime
- This model could be extended with additional fields for notification categories or delivery channels