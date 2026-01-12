"use client";

import { useEffect, useState } from "react";
import { DevicePoint } from "./devicePoint";
import { GardenDevice } from "@/types/device.type";
import { DeviceControl } from "./deviceControlSection";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import Socket from "@/socket/socketConfig";
import { setpumpControl, setTelemetry } from "@/redux/slice/garden.slice";
import { PumpControlSelect } from "./pumSelect";

export const MOCK_DEVICES: GardenDevice[] = [
    {
        id: "dev-1",
        name: "Cảm biến nhiệt độ",
        type: "sensor",
        x: 25,
        y: 30,
        status: "on",
    },
    {
        id: "dev-2",
        name: "Máy bơm tưới A",
        type: "pump",
        x: 55,
        y: 60,
        status: "off",
        mode: "auto",
    },
    {
        id: "dev-3",
        name: "Đèn chiếu sáng khu 1",
        type: "light",
        x: 75,
        y: 35,
        status: "on",
        mode: "manual",
    },
    {
        id: "dev-4",
        name: "Van nước khu 2",
        type: "pump",
        x: 40,
        y: 75,
        status: "error",
        mode: "manual",
    },
];

export function GardenDeviceMap() {
    const dispatch = useAppDispatch();
    const { id, deviceMac, pumpControl } = useAppSelector(
        (state: RootState) => state.gardens.gardenDetail,
    );
    const [selected, setSelected] = useState<GardenDevice | null>(null);

    useEffect(() => {
        Socket.getInstant("devices")?.emit("iot/garden/join", { deviceMac }, (response: any) => {
            const { status, room, initialData } = response;
            if (status) {
                dispatch(setTelemetry(initialData));
            }
        });
    }, [id]);

    const handleControlPump = (action: "ON" | "OFF" | "AUTO") => {
        if (action === pumpControl) return;
        Socket.getInstant("devices")?.emit(
            "iot/device/pump",
            {
                mac: deviceMac,
                action,
            },
            (response: any) => {
                const { status, result } = response;
                if (status === "success") dispatch(setpumpControl(action));
            },
        );
    };

    return (
        <div className="relative rounded-lg border overflow-hidden">
            <img
                src={
                    "https://th.bing.com/th/id/R.74b4dac6013c8f85580c9ba2d0b2dbab?rik=caEBEURBxflU3Q&riu=http%3a%2f%2fwww.ecoworks.org.uk%2fwp-content%2fuploads%2f2008%2f08%2fgarden-map-DRAFT-1.jpg&ehk=jo1nu6S6y4aBbd0po0srY5Lb4unZikGWrWnQkRr47NM%3d&risl=&pid=ImgRaw&r=0"
                }
                alt={"garden map"}
                className="w-full object-cover"
            />
            <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow p-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Điều khiển máy bơm</p>

                <PumpControlSelect value={pumpControl} onChange={handleControlPump} />
            </div>

            {MOCK_DEVICES.map((d) => (
                <DevicePoint key={d.id} device={d} onClick={() => setSelected(d)} />
            ))}

            {selected && (
                <div className="absolute" style={{ left: `${selected.x}%`, top: `${selected.y}%` }}>
                    <DeviceControl device={selected} onClose={() => setSelected(null)} />
                </div>
            )}
        </div>
    );
}
