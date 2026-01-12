export interface GardenDevice {
    id: string;
    name: string;
    type: "sensor" | "pump" | "light";
    x: number; // %
    y: number; // %
    status: "on" | "off" | "error";
    mode?: "auto" | "manual";
}
