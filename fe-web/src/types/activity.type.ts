// types/activity.ts
export type ActivityType =
    | "watering"
    | "device_on"
    | "device_off"
    | "auto_mode"
    | "manual_mode"
    | "sensor_alert";

export interface ActivityProps {
    id: string;
    type: ActivityType;
    message: string;
    createdAt: string;
}
