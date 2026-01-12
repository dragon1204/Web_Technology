"use client";

import { GardenState } from "@/types/garden.type";
import { Cpu, Leaf, Trash2 } from "lucide-react";

interface Props {
    garden: GardenState;
    onClick: () => void;
    onDelete: () => void;
}

export const STATUS_STYLE = {
    online: "bg-green-100 text-green-700",
    offline: "bg-gray-200 text-gray-600",
};

export const ALERT_STYLE = {
    ON: "bg-green-100 text-green-700",
    AUTO: "bg-yellow-100 text-yellow-700",
    OFF: "bg-red-100 text-red-700",
};

export default function GardenCard({ garden, onClick, onDelete }: Props) {
    return (
        <div
            className="relative group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={onClick}
        >
            {/* Delete button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                }}
                className="
                    absolute top-3 right-3
                    p-1.5 rounded-full
                    text-gray-400
                    hover:text-red-600 hover:bg-red-50
                    opacity-100
                    transition
                "
            >
                <Trash2 size={16} />
            </button>

            {/* Header */}
            <div className="flex items-start justify-between mb-3 pr-6">
                <h3 className="font-semibold text-gray-800">{garden.name}</h3>

                <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE["online"]}`}>
                        online
                    </span>

                    <span
                        className={`text-xs px-2 py-1 rounded-full ${
                            ALERT_STYLE[garden.pumpControl]
                        }`}
                    >
                        {garden.pumpControl}
                    </span>
                </div>
            </div>

            {/* Plants */}
            <div className="mb-3">
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                    <Leaf size={14} />
                    Thực vật
                </div>

                <div className="flex flex-wrap gap-1">
                    {garden?.vegetables?.slice(0, 3).map((vegetable) => (
                        <span
                            key={vegetable.id}
                            className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                        >
                            {vegetable.vegetable.name}
                        </span>
                    ))}

                    {garden?.vegetables?.length > 3 && (
                        <span className="text-xs text-gray-500">
                            +{garden.vegetables.length - 3} nữa
                        </span>
                    )}
                </div>
            </div>

            {/* Devices */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
                <Cpu size={16} />
                {!garden.deviceMac ? 0 : 1} thiết bị
            </div>
        </div>
    );
}
