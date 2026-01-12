export type PairStatus = "idle" | "waiting" | "success" | "timeout";

export interface IGardenRealtimeInitState {
    pairStatus: PairStatus;
    error: boolean;
    deviceMac: string;
}
