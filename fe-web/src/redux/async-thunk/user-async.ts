import { getUserData } from "@/services/api.user";
import { IUserState } from "@/types/user.types";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const userInfo = createAsyncThunk<IUserState, void, { rejectValue: any }>(
    "user/user-info",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getUserData();
            if (!response) {
                throw new Error("userInfo is empty");
            }
            return response;
        } catch (err) {
            return rejectWithValue({
                error: "Error fetch userInfo",
            });
        }
    },
);
