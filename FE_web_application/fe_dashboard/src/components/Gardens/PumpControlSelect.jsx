import React from 'react';
import { Box, Button } from '@mui/material';

function PumpControlSelect({ value, onChange }) {
    const options = ['OFF', 'AUTO', 'ON'];

    const getStyle = (option) => {
        if (value === option) {
            switch (option) {
                case 'ON':
                    return {
                        bgcolor: '#16a34a', // green-600
                        color: 'white',
                        borderColor: '#16a34a',
                        '&:hover': { bgcolor: '#15803d' },
                    };
                case 'OFF':
                    return {
                        bgcolor: '#dc2626', // red-600
                        color: 'white',
                        borderColor: '#dc2626',
                        '&:hover': { bgcolor: '#b91c1c' },
                    };
                case 'AUTO':
                    return {
                        bgcolor: '#eab308', // yellow-500
                        color: 'white',
                        borderColor: '#eab308',
                        '&:hover': { bgcolor: '#ca8a04' },
                    };
                default:
                    return {};
            }
        }
        return {
            bgcolor: '#f3f4f6', // gray-100
            color: '#374151', // gray-700
            borderColor: '#d1d5db', // gray-300
            '&:hover': { bgcolor: '#e5e7eb' },
        };
    };

    return (
        <Box sx={{ display: 'inline-flex', borderRadius: 2, overflow: 'hidden', border: '1px solid #d1d5db' }}>
            {options.map((option) => (
                <Button
                    key={option}
                    onClick={() => onChange(option)}
                    disabled={value === option}
                    size="small"
                    sx={{
                        px: 2,
                        py: 1,
                        fontWeight: 500,
                        borderRadius: 0,
                        textTransform: 'none',
                        transition: 'all 0.2s',
                        borderRight: '1px solid #d1d5db',
                        '&:last-child': { borderRight: 'none' },
                        ...getStyle(option),
                        '&:disabled': {
                            ...getStyle(option),
                            opacity: 1, // Keep opacity full to show active state clearly
                            cursor: 'default',
                        },
                    }}
                >
                    {option}
                </Button>
            ))}
        </Box>
    );
}

export default PumpControlSelect;
