"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Socket from "@/socket/socketConfig";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { setPairStatus } from "@/redux/slice/gardenRealTime.slice";

export default function NewGarden() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { gardenDetail } = useAppSelector((state: RootState) => state.gardens);
    const { pairStatus, deviceMac } = useAppSelector((state: RootState) => state.gardenRealtime);

    const [open, setOpen] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(240);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (pairStatus !== "waiting") return;

        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current!);
    }, [pairStatus]);

    const openModal = async () => {
        setOpen(true);
        dispatch(setPairStatus("waiting"));
        setSecondsLeft(240);

        Socket.getInstant("devices")?.emit(
            "iot/device/pair",
            {
                gardenId: gardenDetail.id,
            },
            (response: any) => {
                console.log("start pair", response);
            },
        );
    };

    return (
        <>
            <button onClick={openModal} className="px-4 py-2 rounded bg-green-600 text-white">
                Thêm thiết bị
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-[420px] rounded-lg p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Tìm kiếm thiết bị</h2>

                        {pairStatus === "waiting" && (
                            <>
                                <p className="text-gray-600">Đang chờ thiết bị kết nối...</p>
                                <p className="text-sm text-orange-600">
                                    Thời gian còn lại: {Math.floor(secondsLeft / 60)}:
                                    {(secondsLeft % 60).toString().padStart(2, "0")}
                                </p>
                            </>
                        )}

                        {pairStatus === "timeout" && (
                            <p className="text-red-600">Hết thời gian chờ. Vui lòng thử lại.</p>
                        )}

                        {pairStatus === "success" && (
                            <p className="text-green-600">
                                Đã tìm thiết bị thành công!{" "}
                            </p>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                onClick={() => setOpen(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
