import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loginUser } from "../async-thunk/auth-async";
import { IUserInitState, IUserState } from "@/types/user.types";
import { userInfo } from "../async-thunk/user-async";

const initialState: IUserInitState = {
    user: {
        id: 0,
        name: "",
        email: "",
        role: "USER",
        avatar: "",
        provider: null,
        providerId: null,
        hashedRt: "",
        totpSecret: null,
        isTwoFactorEnabled: false,
        accessToken: "",
    },
    isloading: false,
    error: false,
    status: "idle",
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // auth
        builder.addCase(loginUser.pending, (state) => {
            state.isloading = true;
            state.error = false;
        });
        builder.addCase(
            loginUser.fulfilled,
            (state, action: PayloadAction<{ accessToken: string }>) => {
                state.isloading = false;
                state.error = false;
                state.user.accessToken = action.payload.accessToken;
                state.status = "success";
            },
        );
        builder.addCase(loginUser.rejected, (state) => {
            state.isloading = false;
            state.error = true;
            state.status = "unauthenticated";
        });
        //user
        builder.addCase(userInfo.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(userInfo.fulfilled, (state, action: PayloadAction<IUserState>) => {
            state.user = {
                ...state.user,
                ...action.payload,
            };
            state.error = false;
            state.isloading = false;
            state.status = "success";
        });
        builder.addCase(userInfo.rejected, (state) => {
            state.error = true;
            state.isloading = false;
            state.status = "unauthenticated";
        });
    },
});

export const {} = authSlice.actions;
export default authSlice.reducer;
