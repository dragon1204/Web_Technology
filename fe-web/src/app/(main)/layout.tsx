"use client";

import "./index.css";
import Header from "@/component/header/header";
import SideBar from "@/component/sidebar/sidebar";
import { useEffect } from "react";
import ProtectedRoute from "./protected";
import { useAppDispatch } from "@/redux/store";
import { userInfo } from "@/redux/async-thunk/user-async";
import useSocket from "@/socket/useSocket";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(userInfo());
    }, [dispatch]);

    useSocket({
        namespace: "devices",
        listener: () => {},
    });

    return (
        <ProtectedRoute>
            <div className="app">
                <Header />
                <SideBar />
                <main className="content">{children}</main>
            </div>
        </ProtectedRoute>
    );
}
