"use client";

import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import TemperatureChartGarden from "./chart/temperatureChartGarden";
import HumidityChartGarden from "./chart/humidityChartGarden";
import SoilChartGarden from "./chart/lightChartGarden";
import WateringChartGarden from "./chart/wateringChartGarden";
import { RootState, useAppSelector } from "@/redux/store";
import { fetchMetricSensor } from "@/services/api.devices";

/* ================= TYPES ================= */

type TimeRange = "15m" | "1h" | "12h" | "1d";

type RawSensorData = {
    temperature: number;
    humidity: number;
    soil: number;
    lightDigital: number;
    soilDigital: number;
    timestamp: string;
};

type ChartPoint = {
    time: string; // HH:mm
    value: number;
};

/* ================= CONFIG ================= */

const RANGE_MAP = {
    "15m": { value: 15, unit: "minute" },
    "1h": { value: 1, unit: "hour" },
    "12h": { value: 12, unit: "hour" },
    "1d": { value: 1, unit: "day" },
} as const;

const BUCKET_MAP: Record<TimeRange, { value: number; unit: dayjs.ManipulateType }> = {
    "15m": { value: 3, unit: "minute" },
    "1h": { value: 15, unit: "minute" },
    "12h": { value: 2, unit: "hour" },
    "1d": { value: 4, unit: "hour" },
};

/* ================= COMPONENT ================= */

export default function MetricChartSection() {
    const [range, setRange] = useState<TimeRange>("15m");
    const [rawData, setRawData] = useState<RawSensorData[]>([]);
    const { deviceMac } = useAppSelector((state: RootState) => state.gardens.gardenDetail);

    useEffect(() => {
        const fetch = async () => {
            if (!deviceMac) return;
            try {
                const response = await fetchMetricSensor({
                    time: range,
                    mac: deviceMac,
                });
                setRawData(response ?? []);
            } catch {
                setRawData([]);
            }
        };
        fetch();
    }, [range, deviceMac]);

    /* ===== Aggregate theo range ===== */
    const { temperatureData, humidityData, soilData } = useMemo(() => {
        if (!rawData.length) {
            return {
                temperatureData: [],
                humidityData: [],
                soilData: [],
            };
        }
        return aggregateByRange(rawData, range);
    }, [rawData, range]);

    return (
        <div className="bg-white rounded-xl shadow-sm my-4 p-4">
            {/* Time range selector */}
            <div className="flex gap-2 mb-4">
                {(Object.keys(RANGE_MAP) as TimeRange[]).map((key) => (
                    <button
                        key={key}
                        onClick={() => setRange(key)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition
                            ${
                                range === key
                                    ? "bg-green-600 text-white border-green-600"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                            }
                        `}
                    >
                        {key}
                    </button>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TemperatureChartGarden data={temperatureData} />
                <HumidityChartGarden data={humidityData} />
                <SoilChartGarden data={soilData} />
            </div>
        </div>
    );
}

/* ================= AGGREGATION ================= */

function aggregateByRange(data: RawSensorData[], range: TimeRange) {
    const bucket = BUCKET_MAP[range];

    const bucketMap: Record<string, { temperature: number[]; humidity: number[]; soil: number[] }> =
        {};

    data.forEach((item) => {
        const time = dayjs(item.timestamp);
        let bucketTime: dayjs.Dayjs;

        if (bucket.unit === "minute") {
            bucketTime = time
                .minute(Math.floor(time.minute() / bucket.value) * bucket.value)
                .second(0)
                .millisecond(0);
        } else {
            bucketTime = time
                .hour(Math.floor(time.hour() / bucket.value) * bucket.value)
                .minute(0)
                .second(0)
                .millisecond(0);
        }

        const key = bucketTime.toISOString();

        if (!bucketMap[key]) {
            bucketMap[key] = {
                temperature: [],
                humidity: [],
                soil: [],
            };
        }

        bucketMap[key].temperature.push(item.temperature);
        bucketMap[key].humidity.push(item.humidity);
        bucketMap[key].soil.push(item.soil);
    });

    const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;

    const temperatureData: ChartPoint[] = [];
    const humidityData: ChartPoint[] = [];
    const soilData: ChartPoint[] = [];

    Object.entries(bucketMap)
        .sort(([a], [b]) => dayjs(a).valueOf() - dayjs(b).valueOf())
        .forEach(([time, values]) => {
            const label = dayjs(time).format("HH:mm");

            temperatureData.push({
                time: label,
                value: Number(avg(values.temperature).toFixed(2)),
            });

            humidityData.push({
                time: label,
                value: Number(avg(values.humidity).toFixed(2)),
            });

            soilData.push({
                time: label,
                value: Number(avg(values.soil).toFixed(0)),
            });
        });

    return { temperatureData, humidityData, soilData };
}
