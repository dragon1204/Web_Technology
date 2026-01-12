// types/garden.ts
export type GardenStatus = "online" | "offline";
export type GardenAlert = "none" | "warning" | "critical";

export interface GardenProps {
    id: string;
    name: string;
    status: GardenStatus;
    alert: GardenAlert;
    plants: string[];
    devicesCount: number;
}

export interface Vegetables {
    id: number;
    vegetableId: number;
    quantity: number;
    gardenId: number;
    vegetable: {
        id: number;
        name: string;
        imported: number;
        sold: number;
        price: number;
    };
}

export interface VegatableSales {
    id: number;
    quantity: number;
    total: number;
    time: string;
    gardenId: number;
    vegetableId: number;
    priceAtSale: number;
}

export interface GardenState {
    id: number;
    name: string;
    ownerId: number;
    deviceMac: string | null;
    temperature: number;
    humidity: number;
    soil: number;
    timestamp: string;
    pumpControl: "ON" | "OFF" | "AUTO";
    vegetables: Vegetables[];
    sales: VegatableSales[];
}

export interface GardenResponseFetch {
    gardens: GardenState[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IInitialStateGarden {
    gardens: GardenState[];
    isloading: boolean;
    error: boolean;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    gardenDetail: GardenState;
}
