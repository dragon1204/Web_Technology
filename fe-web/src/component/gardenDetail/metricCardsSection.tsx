import { TypeCard } from "@/types/cards.type";
import { Thermometer, Droplets, Sprout, Sun, Waves } from "lucide-react";
import Card from "../dashboard/card";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { useMemo } from "react";

export const DASHBOARD_CARD_CONFIG = [
    {
        key: "temperature",
        type: TypeCard.TEMPERATURE,
        title: "Nhiệt độ",
        suffix: "°C",
        icon: Thermometer,
    },
    {
        key: "humidity",
        type: TypeCard.HUMIDITY_SOIL,
        title: "Độ ẩm không khí",
        suffix: "%",
        icon: Droplets,
    },
    {
        key: "watering",
        type: TypeCard.WATERING,
        title: "Tưới nước",
        icon: Waves,
    },
    {
        key: "soil",
        type: TypeCard.LIGHT,
        title: "Độ ẩm đất",
        suffix: "ADC",
        icon: Sprout,
    },
];

const MetricCardsSection: React.FC = () => {
    const dispatch = useAppDispatch();
    const { temperature, humidity, pumpControl, soil, timestamp } = useAppSelector(
        (state: RootState) => state.gardens.gardenDetail,
    );
    const cards = useMemo(() => {
        return DASHBOARD_CARD_CONFIG.map((card) => {
            switch (card.key) {
                case "temperature":
                    return {
                        ...card,
                        value: temperature,
                        extra: (
                            <span className="text-green-600">
                                Cập nhật lúc{" "}
                                {timestamp ? new Date(timestamp).toLocaleString() : "--"}
                            </span>
                        ),
                    };

                case "humidity":
                    return {
                        ...card,
                        value: humidity,
                        extra: (
                            <span className="text-green-600">
                                Cập nhật lúc{" "}
                                {timestamp ? new Date(timestamp).toLocaleString() : "--"}
                            </span>
                        ),
                    };

                case "watering":
                    return {
                        ...card,
                        value: pumpControl,
                        extra: (
                            <span className="text-green-600">
                                Cập nhật lúc{" "}
                                {timestamp ? new Date(timestamp).toLocaleString() : "--"}
                            </span>
                        ),
                    };

                case "soil":
                    return {
                        ...card,
                        value: soil,
                        title: soil < 1200 ? "Đất rất ướt" : soil > 2500 ? "Đất khô" : "Đất ẩm",
                        extra: (
                            <span className="text-green-600">
                                Cập nhật lúc{" "}
                                {timestamp ? new Date(timestamp).toLocaleString() : "--"}
                            </span>
                        ),
                    };

                default:
                    return card;
            }
        });
    }, [temperature, soil, pumpControl, timestamp]);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
                <Card {...card} />
            ))}
        </div>
    );
};
export default MetricCardsSection;
