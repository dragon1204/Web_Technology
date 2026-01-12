import { IGardenRealtimeInitState, PairStatus } from "@/types/gardenRealtime.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: IGardenRealtimeInitState = {
    //new add devices
    pairStatus: "idle",
    deviceMac: "",
    error: false,
};

const gardenRealtimeSlice = createSlice({
    name: "garden-realtime-slice",
    initialState,
    reducers: {
        setPairStatus: (state, action: PayloadAction<PairStatus>) => {
            state.pairStatus = action.payload;
        },
        setDeviceMac: (state, action: PayloadAction<string>) => {
            state.deviceMac = action.payload;
        },
    },
    extraReducers: (builder) => {},
});

export const { setPairStatus, setDeviceMac } = gardenRealtimeSlice.actions;
export default gardenRealtimeSlice.reducer;
