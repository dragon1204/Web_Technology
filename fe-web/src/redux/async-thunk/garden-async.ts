import {
    deleteGarden,
    getGardenData,
    getGardenDetail,
    postCeateGarden,
} from "@/services/api.garden";
import { GardenResponseFetch, GardenState } from "@/types/garden.type";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchGardens = createAsyncThunk<
    GardenResponseFetch,
    {
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: "asc" | "desc";
        search?: string;
        searchFields?: string[];
    },
    { rejectValue: any }
>(
    "garden/fetchGardens",
    async (
        payload: {
            page?: number;
            limit?: number;
            sortBy?: string;
            order?: "asc" | "desc";
            search?: string;
            searchFields?: string[];
        },
        { rejectWithValue },
    ) => {
        try {
            const { page, limit, sortBy, order, search, searchFields } = payload;
            const response = await getGardenData({
                page,
                limit,
                sortBy,
                order,
                search,
                searchFields,
            });
            if (!response) {
                throw new Error("No data returned from API");
            }
            return {
                gardens: response.gardens,
                total: response.total,
                page: response.page,
                limit: response.limit,
                totalPages: response.totalPages,
            };
        } catch (err) {
            return rejectWithValue({
                error: "Failed to fetch garden data",
            });
        }
    },
);

export const createGarden = createAsyncThunk<
    GardenState,
    { userId: number; name: string },
    { rejectValue: any }
>("garden/creator", async (payload: { userId: number; name: string }, { rejectWithValue }) => {
    try {
        const { userId, name } = payload;
        const response = await postCeateGarden({ userId, name });
        if (!response) {
            throw new Error("");
        }
        return response;
    } catch (err) {
        return rejectWithValue({
            error: "Create garden error",
        });
    }
});

export const gardenInfo = createAsyncThunk<GardenState, { gardenId: string }, { rejectValue: any }>(
    "garden/detail",
    async (payload: { gardenId: string }, { rejectWithValue }) => {
        try {
            const response = await getGardenDetail({ gardenId: payload.gardenId });
            if (!response) {
                throw new Error("");
            }
            return response;
        } catch (err) {
            return rejectWithValue({
                error: "Garden detail error",
            });
        }
    },
);

export const removeGarden = createAsyncThunk<
    GardenState,
    {
        gardenId: string;
    },
    { rejectValue: any }
>("garden/remove", async (payload: { gardenId: string }, { rejectWithValue }) => {
    try {
        const response = await deleteGarden({ gardenId: payload.gardenId });
        if (!response) {
            throw new Error("");
        }
        return response;
    } catch (err) {
        return rejectWithValue({
            error: "remove garden error",
        });
    }
});
