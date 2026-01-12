"use client";
import "./sidebar.css";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SideBar = () => {
    const [selected, setSelected] = useState("dashboard");

    const menuItems = [
        { id: "dashboard", name: "Dashboard", path: "/dashboard" },
        { id: "garden-icon", name: "My garden", path: "/garden" },
        { id: "notification", name: "Notification", path: "/notification" },
        { id: "profile", name: "Profile", path: "/profile" },
        { id: "sign-up", name: "Sign up", path: "/auth/sign-up" },
        { id: "log-in", name: "Log in", path: "/auth/login" },
        { id: "log-out", name: "Log out", path: "/dashboard" },
    ];

    const router = useRouter();

    return (
        <div className="sidebar">
            <div className="sidebar-head">
                <Image src="/smart-garden-icon.png" alt="logo" width={30} height={30} />
                <p className="title">SMART GARDEN</p>
            </div>

            <hr />

            <ul className="sidebar-list">
                {menuItems.map((item) => (
                    <li
                        key={item.id}
                        className={`sidebar-item ${selected === item.id ? "active" : ""}`}
                        onClick={() => {
                            setSelected(item.id);
                            router.push(`${item.path}`);
                        }}
                    >
                        <Image
                            className="item-icon"
                            src={`/${item.id}.png`}
                            alt="icon"
                            width={24}
                            height={24}
                        />
                        <div className="item-name">{item.name}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SideBar;
