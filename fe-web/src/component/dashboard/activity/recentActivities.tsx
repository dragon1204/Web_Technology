import { ActivityProps } from "@/types/activity.type";
import Activity from "./activity";

const mockActivities: ActivityProps[] = [
    {
        id: "1",
        type: "watering",
        message: "Hệ thống đã tưới nước khu A",
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
        id: "2",
        type: "device_on",
        message: "Đã bật đèn chiếu sáng",
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
        id: "3",
        type: "auto_mode",
        message: "Chuyển sang chế độ tưới tự động",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
];

export default function RecentActivities() {
    return (
        <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Hoạt động gần đây</h2>

            <div className="divide-y divide-gray-100">
                {mockActivities.map((activity) => (
                    <Activity key={activity.id} activity={activity} />
                ))}
            </div>
        </div>
    );
}
