import { GardenResponseFetch, GardenState, IInitialStateGarden } from "@/types/garden.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createGarden, fetchGardens, gardenInfo, removeGarden } from "../async-thunk/garden-async";

const initialState: IInitialStateGarden = {
    gardens: [],
    total: 0,
    page: 0,
    limit: 10,
    totalPages: 0,
    gardenDetail: {
        id: 0,
        name: "",
        ownerId: 0,
        deviceMac: null,
        temperature: 0,
        humidity: 0,
        soil: 0,
        timestamp: "",
        pumpControl: "ON",
        vegetables: [],
        sales: [],
    },
    isloading: false,
    error: false,
};

const gardenSlice = createSlice({
    name: "garden",
    initialState,
    reducers: {
        setTelemetry: (state, action: PayloadAction<any>) => {
            state.gardenDetail.temperature = action.payload.temperature;
            state.gardenDetail.humidity = action.payload.humidity;
            state.gardenDetail.soil = action.payload.soil;
            state.gardenDetail.timestamp = action.payload.timestamp;
            state.gardenDetail.pumpControl = action.payload.pumpControl;
        },
        setpumpControl: (state, action: PayloadAction<"ON" | "OFF" | "AUTO">) => {
            state.gardenDetail.pumpControl = action.payload;
        },
        setSensorMetric: (state, action: PayloadAction<any>) => {
            state.gardenDetail.temperature = action.payload.temperature;
            state.gardenDetail.humidity = action.payload.humidity;
            state.gardenDetail.soil = action.payload.soil;
            state.gardenDetail.timestamp = action.payload.timestamp;
        },
    },
    extraReducers: (builder) => {
        //fetch
        builder.addCase(fetchGardens.pending, (state) => {
            state.isloading = true;
            state.error = false;
        });
        builder.addCase(
            fetchGardens.fulfilled,
            (state, action: PayloadAction<GardenResponseFetch>) => {
                if (action.payload.page === 1) {
                    state.gardens = action.payload.gardens;
                } else {
                    state.gardens.push(...action.payload.gardens);
                }
                state.totalPages = action.payload.totalPages;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.error = false;
                state.isloading = false;
            },
        );
        builder.addCase(fetchGardens.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });
        //creator
        builder.addCase(createGarden.pending, (state) => {
            state.isloading = true;
            state.error = false;
        });
        builder.addCase(createGarden.fulfilled, (state, action: PayloadAction<GardenState>) => {
            console.log(action.payload);
            state.error = false;
            state.isloading = false;
            state.gardens.push(action.payload);
        });
        builder.addCase(createGarden.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });
        //garden detail
        builder.addCase(gardenInfo.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(gardenInfo.fulfilled, (state, action: PayloadAction<GardenState>) => {
            state.error = false;
            state.isloading = false;
            state.gardenDetail = {
                ...state.gardenDetail,
                ...action.payload,
            };
        });
        builder.addCase(gardenInfo.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });
        //remove garden
        builder.addCase(removeGarden.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(removeGarden.fulfilled, (state, action: PayloadAction<GardenState>) => {
            state.gardens = state.gardens.filter((garden) => garden.id !== action.payload.id);
            state.error = false;
            state.isloading = false;
        });
        builder.addCase(removeGarden.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });
    },
});

export const { setTelemetry, setpumpControl, setSensorMetric } = gardenSlice.actions;
export default gardenSlice.reducer;
