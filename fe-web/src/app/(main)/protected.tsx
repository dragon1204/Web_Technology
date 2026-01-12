"use client";

import { userInfo } from "@/redux/async-thunk/user-async";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const { user, isloading, status } = useAppSelector((state: RootState) => state.user);
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            dispatch(userInfo());
        }
    }, [dispatch]);

    useEffect(() => {
        if (!isloading && !user?.id && status === "unauthenticated") {
            router.replace("/auth/login");
        }
    }, [isloading, user, router]);

    return <>{children}</>;
};

export default ProtectedRoute;
