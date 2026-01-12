import { postLogin } from "@/services/api.auth";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk<
    { accessToken: string },
    { email: string; password: string },
    {
        rejectValue: any;
    }
>("auth/loginUser", async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
        const response = await postLogin({ email: payload.email, password: payload.password });
        if (!response) {
            throw new Error("No data returned from API");
        }
        return {
            accessToken: response.accessToken,
        };
    } catch (err) {
        return rejectWithValue({
            error: "Error login user",
        });
    }
});
