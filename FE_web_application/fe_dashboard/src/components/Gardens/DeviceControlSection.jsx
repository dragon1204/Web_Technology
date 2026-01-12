import React from 'react';
import { Box, Typography, Button, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function DeviceControlSection({ device, onClose }) {
    return (
        <Paper
            elevation={3}
            sx={{
                position: 'absolute',
                zIndex: 20,
                width: 256,
                p: 2,
                borderRadius: 2,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight="medium">
                    {device.name}
                </Typography>
                <IconButton size="small" onClick={onClose} sx={{ color: '#9ca3af' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Status: <b>{device.status}</b>
            </Typography>

            {device.type !== 'sensor' && (
                <Box display="flex" gap={1}>
                    <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        color="success"
                        sx={{ textTransform: 'none', py: 0.5 }}
                    >
                        ON
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        sx={{
                            backgroundColor: '#d1d5db', // gray-300
                            color: 'black',
                            '&:hover': { backgroundColor: '#9ca3af' },
                            textTransform: 'none',
                            py: 0.5,
                        }}
                    >
                        OFF
                    </Button>
                </Box>
            )}

            {device.mode && (
                <Typography variant="caption" display="block" mt={1}>
                    Mode: <b>{device.mode}</b>
                </Typography>
            )}
        </Paper>
    );
}

export default DeviceControlSection;
