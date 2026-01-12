"use client";

import { Droplets, Power, Settings, AlertTriangle } from "lucide-react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ActivityProps } from "@/types/activity.type";

export const ACTIVITY_CONFIG = {
    watering: {
        icon: Droplets,
        color: "text-cyan-600",
        bg: "bg-cyan-100",
    },
    device_on: {
        icon: Power,
        color: "text-green-600",
        bg: "bg-green-100",
    },
    device_off: {
        icon: Power,
        color: "text-red-600",
        bg: "bg-red-100",
    },
    auto_mode: {
        icon: Settings,
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    manual_mode: {
        icon: Settings,
        color: "text-yellow-600",
        bg: "bg-yellow-100",
    },
    sensor_alert: {
        icon: AlertTriangle,
        color: "text-orange-600",
        bg: "bg-orange-100",
    },
};

dayjs.extend(relativeTime);

interface Props {
    activity: ActivityProps;
}

export default function Activity({ activity }: Props) {
    const config = ACTIVITY_CONFIG[activity.type];
    const Icon = config.icon;

    return (
        <div className="flex items-start gap-3 py-2">
            {/* Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bg}`}>
                <Icon size={16} className={config.color} />
            </div>

            {/* Content */}
            <div className="flex-1">
                <p className="text-sm text-gray-800">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                    {dayjs(activity.createdAt).fromNow()}
                </p>
            </div>
        </div>
    );
}
