import { GardenDevice } from "@/types/device.type";

export function DevicePoint({ device, onClick }: { device: GardenDevice; onClick: () => void }) {
    const color =
        device.status === "on"
            ? "text-green-500"
            : device.status === "off"
            ? "text-gray-400"
            : "text-red-500";

    return (
        <button
            onClick={onClick}
            className="absolute -translate-x-1/2 -translate-y-full group border"
            style={{ left: `${device.x}%`, top: `${device.y}%` }}
        >
            {/* Pulse ring (optional, chỉ bật khi on) */}
            {device.status === "on" && (
                <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />
            )}

            {/* Pin icon */}
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`${color} drop-shadow-md transition-transform group-hover:scale-110`}
            >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
            </svg>

            {/* Center dot */}
            <span
                className={`absolute left-1/2 top-[9px] -translate-x-1/2 w-2 h-2 rounded-full
          ${device.status === "on" && "bg-green-200"}
          ${device.status === "off" && "bg-gray-200"}
          ${device.status === "error" && "bg-red-200"}
        `}
            />
        </button>
    );
}
