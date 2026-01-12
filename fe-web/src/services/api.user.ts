import { IUserState } from "@/types/user.types";
import { apiService } from "./apiConfig";

export const getUserData = async () => {
    try {
        const response = await apiService.get<{ data: IUserState }>("users/me");
        return response.data;
    } catch (err) {
        console.log("Error fetching user data: ", err);
        return null;
    }
};
