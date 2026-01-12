import { GardenDevice } from "@/types/device.type";

export function DeviceControl({ device, onClose }: { device: GardenDevice; onClose: () => void }) {
    return (
        <div className="absolute z-20 w-64 rounded-lg bg-white border shadow-lg p-3">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">{device.name}</h4>
                <button onClick={onClose} className="text-gray-400">
                    ✕
                </button>
            </div>

            <div className="text-xs text-gray-500 mb-2">
                Status: <b>{device.status}</b>
            </div>

            {device.type !== "sensor" && (
                <div className="flex gap-2">
                    <button className="flex-1 py-1 rounded bg-green-500 text-white">ON</button>
                    <button className="flex-1 py-1 rounded bg-gray-300">OFF</button>
                </div>
            )}

            {device.mode && (
                <div className="mt-2 text-xs">
                    Mode: <b>{device.mode}</b>
                </div>
            )}
        </div>
    );
}
