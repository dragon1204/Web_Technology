import React from 'react';
import { Box } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function DevicePoint({ device, onClick }) {
  const getColor = () => {
    switch (device.status) {
      case 'on':
        return '#22c55e'; // green-500
      case 'off':
        return '#9ca3af'; // gray-400
      case 'error':
        return '#ef4444'; // red-500
      default:
        return '#9ca3af';
    }
  };

  const getBgColor = () => {
    switch (device.status) {
      case 'on':
        return '#bbf7d0'; // green-200
      case 'off':
        return '#e5e7eb'; // gray-200
      case 'error':
        return '#fecaca'; // red-200
      default:
        return '#e5e7eb';
    }
  };

  const color = getColor();

  return (
    <Box
      component="button"
      onClick={onClick}
      className="group"
      sx={{
        position: 'absolute',
        left: `${device.x}%`,
        top: `${device.y}%`,
        transform: 'translate(-50%, -100%)',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: 0,
        '&:hover svg': {
          transform: 'scale(1.1)',
        },
      }}
    >
      {/* Pulse ring (optional, only when on) */}
      {device.status === 'on' && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: '#4ade80', // green-400
            opacity: 0.3,
            animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
            '@keyframes ping': {
              '75%, 100%': {
                transform: 'scale(2)',
                opacity: 0,
              },
            },
          }}
        />
      )}

      {/* Pin icon */}
      <LocationOnIcon
        sx={{
          fontSize: 32,
          color: color,
          filter: 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))',
          transition: 'transform 0.2s',
        }}
      />

      {/* Center dot */}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '13px', // Adjust visually to center in the pin head
          transform: 'translateX(-50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: getBgColor(),
        }}
      />
    </Box>
  );
}

export default DevicePoint;
