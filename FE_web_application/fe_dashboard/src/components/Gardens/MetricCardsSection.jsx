import React, { useMemo } from 'react';
import { Box, Card, Grid, Typography, useTheme, alpha } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import GrassIcon from '@mui/icons-material/Grass'; // For Soil
import OpacityIcon from '@mui/icons-material/Opacity'; // For Watering/Pump
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'; // Fallback

// Configuration for cards
const DASHBOARD_CARD_CONFIG = [
    {
        key: "temperature",
        type: "TEMPERATURE",
        title: "Nhiệt độ",
        suffix: "°C",
        icon: ThermostatIcon,
        color: "error", // Red
        bgColor: "#FEF2F2", // red-50
        textColor: "#DC2626", // red-600
    },
    {
        key: "humidity",
        type: "HUMIDITY",
        title: "Độ ẩm không khí",
        suffix: "%",
        icon: WaterDropIcon,
        color: "info", // Blue
        bgColor: "#EFF6FF", // blue-50
        textColor: "#2563EB", // blue-600
    },
    {
        key: "watering",
        type: "WATERING",
        title: "Tưới nước",
        icon: OpacityIcon,
        color: "cyan",
        bgColor: "#ECFEFF", // cyan-50
        textColor: "#0891B2", // cyan-600
    },
    {
        key: "soil",
        type: "SOIL",
        title: "Độ ẩm đất",
        suffix: "ADC",
        icon: GrassIcon,
        color: "success", // Green/Emerald
        bgColor: "#ECFDF5", // emerald-50
        textColor: "#059669", // emerald-600
    },
];

const MetricCard = ({ title, value, suffix, icon: Icon, extra, bgColor, textColor }) => {
    return (
        <Card
            sx={{
                p: 2,
                borderRadius: 3,
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // shadow-sm
                border: '1px solid #e5e7eb',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>
                    {title}
                </Typography>
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: bgColor,
                        color: textColor,
                    }}
                >
                    <Icon sx={{ width: 20, height: 20 }} />
                </Box>
            </Box>

            {/* Value */}
            {value !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                        {value}
                    </Typography>
                    {suffix && (
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                            {suffix}
                        </Typography>
                    )}
                </Box>
            )}

            {/* Extra content */}
            {extra && (
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {extra}
                </Typography>
            )}
        </Card>
    );
};

const MetricCardsSection = ({ data }) => {
    const { temperature, humidity, pumpControl, soil, timestamp } = data || {};

    const cards = useMemo(() => {
        return DASHBOARD_CARD_CONFIG.map((card) => {
            const commonExtra = (
                <span style={{ color: '#16a34a' }}>
                    Cập nhật lúc {timestamp ? new Date(timestamp).toLocaleString() : "--"}
                </span>
            );

            switch (card.key) {
                case "temperature":
                    return {
                        ...card,
                        value: temperature ?? '--',
                        extra: commonExtra,
                    };

                case "humidity":
                    return {
                        ...card,
                        value: humidity ?? '--',
                        extra: commonExtra,
                    };

                case "watering":
                    return {
                        ...card,
                        value: pumpControl ?? 'OFF',
                        extra: commonExtra,
                    };

                case "soil":
                    const soilValue = soil ?? 0;
                    const statusText = soilValue < 1200 ? "Đất rất ướt" : soilValue > 2500 ? "Đất khô" : "Đất ẩm";
                    return {
                        ...card,
                        value: soil ?? '--',
                        title: `Độ ẩm đất (${statusText})`, // Dynamic title based on soil value logic
                        extra: commonExtra,
                    };

                default:
                    return card;
            }
        });
    }, [temperature, humidity, pumpControl, soil, timestamp]);

    return (
        <Grid container spacing={2}>
            {cards.map((card) => (
                <Grid item xs={12} sm={6} lg={3} key={card.key}>
                    <MetricCard {...card} />
                </Grid>
            ))}
        </Grid>
    );
};

export default MetricCardsSection;
