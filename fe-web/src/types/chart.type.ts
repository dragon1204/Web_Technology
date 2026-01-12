import { TypeCard } from "./cards.type";

export const CHART_COLOR: Record<TypeCard, string> = {
    [TypeCard.TEMPERATURE]: "#ef4444",
    [TypeCard.HUMIDITY_AIR]: "#3b82f6",
    [TypeCard.HUMIDITY_SOIL]: "#10b981",
    [TypeCard.LIGHT]: "#eab308",
    [TypeCard.WATERING]: "#06b6d4",
    [TypeCard.DEVICE]: "#64748b",
};
