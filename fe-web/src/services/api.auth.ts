import { apiService } from "./apiConfig";

export const postLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
        const response = await apiService.post<{
            data: {
                tokens: {
                    access_token: string;
                    refresh_token: string;
                };
            };
        }>("/auth/login", {
            email,
            password,
        });
        return {
            accessToken: response.data.tokens.access_token,
        };
    } catch (err) {
        console.log("Error login: ", err);
        return null;
    }
};
