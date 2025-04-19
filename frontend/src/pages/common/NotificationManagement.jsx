import React, { useState, useEffect } from 'react';
import { 
  TextField, Box, Typography, Card, CardContent,
  Snackbar, Alert, Fade, InputAdornment, Chip,
  Paper, CircularProgress, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RepeatIcon from '@mui/icons-material/Repeat';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const NotificationManagement = () => {
  const { axiosInstance, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // States
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: 'success',
    message: ''
  });

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications when search query changes
  useEffect(() => {
    filterNotifications();
  }, [searchQuery, notifications]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // For regular users, get only their notifications
      // For admins, get all notifications
      let endpoint = '/notifications';
      if (!isAdmin) {
        endpoint += `?email=${encodeURIComponent(user.email)}`;
      }
      
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}${endpoint}`);
      
      // Filter for only future or recurring notifications
      const filteredData = response.data.notifications.filter(
        notification => notification.future || notification.recurring
      );
      
      setNotifications(filteredData);
      setFilteredNotifications(filteredData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showAlert('error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter notifications based on search query
  const filterNotifications = () => {
    if (!searchQuery.trim()) {
      setFilteredNotifications(notifications);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = notifications.filter(notification => 
      notification.receiverEmail?.toLowerCase().includes(query) ||
      notification.content?.toLowerCase().includes(query) ||
      notification._id?.includes(query) ||
      notification.senderEmail?.toLowerCase().includes(query)
    );
    
    setFilteredNotifications(filtered);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (notification) => {
    setSelectedNotification(notification);
    setDeleteDialogOpen(true);
  };

  // Delete notification after confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedNotification) return;
    
    setDeleting(true);
    try {
      await axiosInstance.delete(`${import.meta.env.VITE_API_URL}/notifications/${selectedNotification._id}`);
      
      // Remove the deleted notification from the list
      setNotifications(prev => prev.filter(n => n._id !== selectedNotification._id));
      
      showAlert('success', 'Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showAlert('error', 'Failed to delete notification');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
    }
  };

  // Close delete dialog
  const handleDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedNotification(null);
  };
  
  // Show alert message
  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  // Close alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };
  
  // Format notification ID to show only last 6 chars
  const formatNotificationId = (id) => {
    return id.slice(-6);
  };
  
  // Get first few words of a message
  const getMessagePreview = (content, wordCount = 5) => {
    if (!content) return '';
    const words = content.split(' ');
    const preview = words.slice(0, wordCount).join(' ');
    return words.length > wordCount ? `${preview}...` : preview;
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Card 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': { boxShadow: 6 }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(120deg, #9c27b0 0%, #673ab7 100%)',
          color: 'white'
        }}>
          <Typography variant="h5" component="h1" fontWeight="500" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <NotificationsActiveIcon fontSize="large" />
            Manage Notifications
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            View and manage your scheduled and recurring notifications
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 3 }}>
          {/* Search bar */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by recipient email, content, or notification ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
          
          {/* Status bar */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            mb: 2,
            flexWrap: 'wrap',
            gap: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                icon={<AccessTimeIcon />} 
                label="Future" 
                size="small" 
                color="info" 
                variant="outlined" 
              />
              <Chip 
                icon={<RepeatIcon />} 
                label="Recurring" 
                size="small" 
                color="secondary" 
                variant="outlined" 
              />
            </Box>
          </Box>
          
          {/* Loading state */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            /* Empty state */
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                bgcolor: 'rgba(0,0,0,0.02)',
                borderRadius: 2,
                border: '1px dashed rgba(0,0,0,0.2)',
              }}
            >
              <NotificationsOffIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Notifications Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Try adjusting your search query' : 'You have not created any future or recurring notifications yet'}
              </Typography>
            </Paper>
          ) : (
            /* Notifications table */
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid rgba(0,0,0,0.08)' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Scheduled</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    {isAdmin && (
                      <TableCell sx={{ fontWeight: 600 }}>Created By</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification._id} hover>
                      <TableCell>
                        <Tooltip title={`Full ID: ${notification._id}`}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            {formatNotificationId(notification._id)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={notification.content}>
                          <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {getMessagePreview(notification.content)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {notification.receiverEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2">
                            {formatDate(notification.date)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.time}
                          </Typography>
                          {notification.recurring && (
                            <Chip 
                              label={notification.frequency} 
                              size="small" 
                              color="secondary" 
                              variant="outlined" 
                              sx={{ maxWidth: 'fit-content' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {notification.future && (
                            <Chip label="Future" size="small" color="info" />
                          )}
                          {notification.recurring && (
                            <Chip label="Recurring" size="small" color="secondary" />
                          )}
                        </Box>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Typography variant="body2">
                            {notification.senderEmail}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Tooltip title="Delete notification">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleDeleteClick(notification)}
                            aria-label="delete notification"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDialogClose}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this notification?
            {selectedNotification?.recurring && (
              <Box component="span" fontWeight="bold"> This will also cancel all future recurrences.</Box>
            )}
          </DialogContentText>
          {selectedNotification && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notification details:
              </Typography>
              <Typography variant="body2">
                <strong>ID:</strong> {formatNotificationId(selectedNotification._id)}
              </Typography>
              <Typography variant="body2">
                <strong>To:</strong> {selectedNotification.receiverEmail}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Message:</strong> {getMessagePreview(selectedNotification.content, 10)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleDialogClose} 
            color="inherit"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alert.severity}
          variant="filled"
          elevation={6}
          sx={{ borderRadius: 2, fontWeight: 500 }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationManagement;