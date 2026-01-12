// components/charts/BaseLineChart.tsx
"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

interface Props {
    data: { time: string; value: number }[];
    color: string;
    unit?: string;
}

const truncateLabel = (value: string, max = 6) => {
    if (!value) return "";
    return value.length > max ? `${value.slice(0, max)}…` : value;
};

export default function BaseLineChart({ data, color, unit }: Props) {
    return (
        <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
                    {/* Grid */}
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />

                    {/* Trục X */}
                    <XAxis
                        dataKey="time"
                        axisLine={{ stroke: "#d1d5db" }}
                        tickLine={false}
                        tick={{
                            fontSize: 12,
                            fill: "#6b7280",
                        }}
                        tickFormatter={(v: string) => truncateLabel(v, 8)}
                    />

                    {/* Trục Y */}
                    <YAxis
                        axisLine={{ stroke: "#d1d5db" }}
                        tickLine={false}
                        width={44}
                        tick={{
                            fontSize: 12,
                            fill: "#6b7280",
                        }}
                        label={
                            unit
                                ? {
                                      value: unit,
                                      position: "insideTopLeft",
                                      offset: 0,
                                      fill: "#6b7280",
                                      fontSize: 12,
                                  }
                                : undefined
                        }
                    />

                    {/* Tooltip */}
                    <Tooltip
                        cursor={{
                            stroke: color,
                            strokeWidth: 1,
                            strokeDasharray: "4 4",
                        }}
                        contentStyle={{
                            backgroundColor: "#ffffff",
                            borderRadius: 10,
                            border: "none",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                            fontSize: 12,
                        }}
                        labelStyle={{
                            color: "#374151",
                            fontWeight: 500,
                        }}
                        formatter={(value) => {
                            if (value == null) return "--";
                            return unit ? `${value} ${unit}` : value;
                        }}
                    />

                    {/* Line + pointer */}
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={3}
                        dot={{
                            r: 2,
                            stroke: color,
                            strokeWidth: 1,
                            fill: "#ffffff",
                        }}
                        activeDot={{
                            r: 3,
                            stroke: color,
                            strokeWidth: 2,
                            fill: "#ffffff",
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
