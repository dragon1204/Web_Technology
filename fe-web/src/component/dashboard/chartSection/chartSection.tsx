// components/charts/ChartSection.tsx
"use client";

import { Button } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import TemperatureChart from "./temperatureChart";
import HumidityChart from "./humidityChart";
import LightChart from "./lightChart";
import WateringChart from "./wateringChart";
import DateFilter from "../dateFilter";

export default function ChartSection() {
    const [date, setDate] = useState<Dayjs>(dayjs());

    return (
        <div className="bg-white rounded-xl shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Thống kê theo ngày</h2>
                <DateFilter value={date} onChange={setDate} />
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TemperatureChart />
                <HumidityChart />
                <LightChart />
                <WateringChart />
            </div>
        </div>
    );
}
