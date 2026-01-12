import { TypeCard } from "@/types/cards.type";
import { Thermometer, Droplets, Sprout, Sun, Waves } from "lucide-react";
import Card from "../card";

export const DASHBOARD_CARDS = [
    {
        key: "temperature",
        type: TypeCard.TEMPERATURE,
        title: "Nhiệt độ",
        value: 32,
        suffix: "°C",
        icon: Thermometer,
        extra: <span className="text-green-600">Đã cập nhật 10 phút trước</span>,
    },
    {
        key: "humidity_soil",
        type: TypeCard.HUMIDITY_SOIL,
        title: "Độ ẩm đất",
        value: 45,
        suffix: "%",
        icon: Droplets,
        extra: <span className="text-green-600">Đã cập nhật 10 phút trước</span>,
    },
    {
        key: "watering",
        type: TypeCard.WATERING,
        title: "Tưới nước",
        value: "Auto",
        icon: Waves,
        extra: <span className="text-green-600">Đã tưới 10 phút trước</span>,
    },
    {
        key: "light",
        type: TypeCard.LIGHT,
        title: "Ánh sáng",
        icon: Sun,
        value: 500,
        suffix: "lux",
        extra: <span className="text-green-600">Đã cập nhật 10 phút trước</span>,
    },
];

const CardDashboard: React.FC = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DASHBOARD_CARDS.map((card) => (
                <Card
                    key={card.key}
                    type={card.type}
                    title={card.title}
                    value={card.value}
                    suffix={card.suffix}
                    icon={card.icon}
                    extra={card.extra}
                />
            ))}
        </div>
    );
};
export default CardDashboard;
