import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SensorDataDisplay from '../SensorData/SensorDataDisplay';

/**
 * Component hiển thị chi tiết garden với dữ liệu sensor realtime
 */
function GardenDetail({ garden, open, onClose }) {
  if (!garden) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{garden.name}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="textSecondary">
            Garden ID: {garden.id}
          </Typography>
          {garden.deviceMac && (
            <Typography variant="body2" color="textSecondary">
              Device MAC: {garden.deviceMac}
            </Typography>
          )}
        </Box>

        {garden.deviceMac ? (
          <SensorDataDisplay
            deviceMac={garden.deviceMac}
            showControls={true}
          />
        ) : (
          <Card>
            <CardContent>
              <Typography color="textSecondary">
                Garden này chưa có device được kết nối. Vui lòng pair device trước.
              </Typography>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default GardenDetail;
