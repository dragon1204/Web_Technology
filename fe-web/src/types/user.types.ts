export interface IUserState {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
    provider: any;
    providerId: any;
    hashedRt: string;
    totpSecret: any;
    isTwoFactorEnabled: boolean;
    accessToken?: string;
}

export interface IUserInitState {
    user: IUserState;
    isloading: boolean;
    error: boolean;
    status: "idle" | "unauthenticated" | "success";
}
