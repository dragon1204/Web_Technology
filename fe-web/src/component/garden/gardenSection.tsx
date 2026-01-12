"use client";

import GardenCard from "./gardenCard";
import { useRouter } from "next/navigation";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { createGarden, removeGarden } from "@/redux/async-thunk/garden-async";
import { useState } from "react";

export default function MyGardenSection() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { gardens, isloading, error } = useAppSelector((state: RootState) => state.gardens);
    const { user } = useAppSelector((state: RootState) => state.user);

    const [showInput, setShowInput] = useState(false);
    const [gardenName, setGardenName] = useState("");

    const handleCreateGarden = () => {
        if (!gardenName.trim() || isloading || error) return;

        dispatch(createGarden({ userId: user.id, name: gardenName }));

        setGardenName("");
        setShowInput(false);
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">My Garden</h2>

                <button
                    className="text-sm text-green-600 hover:underline"
                    onClick={() => setShowInput(true)}
                >
                    + Thêm garden
                </button>
            </div>
            {/* Input create garden */}
            {showInput && (
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="text"
                        value={gardenName}
                        onChange={(e) => setGardenName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateGarden();
                            if (e.key === "Escape") setShowInput(false);
                        }}
                        placeholder="Nhập tên garden..."
                        className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoFocus
                    />

                    <button
                        onClick={handleCreateGarden}
                        disabled={isloading}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        Tạo
                    </button>

                    <button
                        onClick={() => setShowInput(false)}
                        className="text-sm text-gray-500 hover:underline"
                    >
                        Hủy
                    </button>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gardens.map((garden) => (
                    <GardenCard
                        key={garden.id}
                        garden={garden}
                        onClick={() => {
                            router.push(`/garden/${garden.id}`);
                        }}
                        onDelete={() => {
                            dispatch(removeGarden({ gardenId: garden.id.toString() }));
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
