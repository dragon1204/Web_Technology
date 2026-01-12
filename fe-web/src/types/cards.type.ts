import React from "react";
export enum TypeCard {
    TEMPERATURE = "temperature",
    HUMIDITY_AIR = "humidity_air",
    HUMIDITY_SOIL = "humidity_soil",
    LIGHT = "light",
    WATERING = "watering",
    DEVICE = "device",
}

export interface CardProps {
    type: TypeCard;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    title: string;
    value?: number | string;
    suffix?: string;
    extra?: React.ReactNode;
}
