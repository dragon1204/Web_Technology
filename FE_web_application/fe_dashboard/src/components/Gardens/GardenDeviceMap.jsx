import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import DevicePoint from './DevicePoint';
import DeviceControlSection from './DeviceControlSection';
import PumpControlSelect from './PumpControlSelect';

export const MOCK_DEVICES = [
    {
        id: 'dev-1',
        name: 'Cảm biến nhiệt độ',
        type: 'sensor',
        x: 25,
        y: 30,
        status: 'on',
    },
    {
        id: 'dev-2',
        name: 'Máy bơm tưới A',
        type: 'pump',
        x: 55,
        y: 60,
        status: 'off',
        mode: 'auto',
    },
    {
        id: 'dev-3',
        name: 'Đèn chiếu sáng khu 1',
        type: 'light',
        x: 75,
        y: 35,
        status: 'on',
        mode: 'manual',
    },
    {
        id: 'dev-4',
        name: 'Van nước khu 2',
        type: 'pump',
        x: 40,
        y: 75,
        status: 'error',
        mode: 'manual',
    },
];

function GardenDeviceMap({ pumpStatus, onPumpControl, sensorData }) {
    const [selected, setSelected] = useState(null);

    // Merge real sensor data into mock devices if possible (for demo visualization primarily)
    const devices = MOCK_DEVICES.map((d) => {
        // Basic mapping logic: if pump, use real pump status
        if (d.type === 'pump' && d.id === 'dev-2') {
            return { ...d, status: pumpStatus === 'ON' ? 'on' : 'off', mode: pumpStatus === 'AUTO' ? 'auto' : 'manual' };
        }
        // If sensor, maybe use real status if available (mocking 'on' for now as in reference)
        return d;
    });

    return (
        <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <img
                src="https://th.bing.com/th/id/R.74b4dac6013c8f85580c9ba2d0b2dbab?rik=caEBEURBxflU3Q&riu=http%3a%2f%2fwww.ecoworks.org.uk%2fwp-content%2fuploads%2f2008%2f08%2fgarden-map-DRAFT-1.jpg&ehk=jo1nu6S6y4aBbd0po0srY5Lb4unZikGWrWnQkRr47NM%3d&risl=&pid=ImgRaw&r=0"
                alt="garden map"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />

            {/* Control Panel Overlay */}
            <Paper
                elevation={2}
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 10,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    p: 1.5,
                }}
            >
                <Typography variant="body2" fontWeight="600" color="text.secondary" mb={1}>
                    Điều khiển máy bơm
                </Typography>
                <PumpControlSelect value={pumpStatus} onChange={onPumpControl} />
            </Paper>

            {devices.map((d) => (
                <DevicePoint key={d.id} device={d} onClick={() => setSelected(d)} />
            ))}

            {selected && (
                <Box
                    sx={{
                        position: 'absolute',
                        left: `${selected.x}%`,
                        top: `${selected.y}%`,
                        // Positioning logic handled in CSS/Component, but we need a container here 
                        // to match reference wrapping. DeviceControlSection handles its own size.
                    }}
                >
                    <DeviceControlSection device={selected} onClose={() => setSelected(null)} />
                </Box>
            )}
        </Box>
    );
}

export default GardenDeviceMap;
