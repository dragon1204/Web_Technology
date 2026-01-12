import { CardProps, TypeCard } from "@/types/cards.type";
import React from "react";
export const CARD_STYLE: Record<TypeCard, string> = {
    [TypeCard.TEMPERATURE]: "bg-red-50 text-red-600",
    [TypeCard.HUMIDITY_AIR]: "bg-blue-50 text-blue-600",
    [TypeCard.HUMIDITY_SOIL]: "bg-emerald-50 text-emerald-600",
    [TypeCard.LIGHT]: "bg-yellow-50 text-yellow-600",
    [TypeCard.WATERING]: "bg-cyan-50 text-cyan-600",
    [TypeCard.DEVICE]: "bg-slate-50 text-slate-600",
};

// Card.tsx

const Card: React.FC<CardProps> = ({ type, icon: Icon, title, value, suffix, extra }) => {
    return (
        <div className={"rounded-xl p-4 shadow-sm border bg-white flex flex-col gap-1"}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">{title}</span>
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${CARD_STYLE[type]}`}
                >
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {/* Value */}
            {value !== undefined && (
                <div className="flex items-end gap-1">
                    <span className="text-2xl font-semibold text-gray-800">{value}</span>
                    {suffix && <span className="text-sm text-gray-500 mb-0.5">{suffix}</span>}
                </div>
            )}

            {/* Extra content */}
            {extra && <div className="text-sm text-gray-500">{extra}</div>}
        </div>
    );
};

export default Card;
