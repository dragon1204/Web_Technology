import { CHART_COLOR } from "@/types/chart.type";
import BaseLineChart from "../chart/lineChart";
import { TypeCard } from "@/types/cards.type";

export default function WateringChart() {
    const data = [
        { time: "06:00", value: 0 },
        { time: "09:00", value: 1 },
        { time: "12:00", value: 0 },
        { time: "15:00", value: 1 },
        { time: "18:00", value: 0 },
    ];

    return (
        <div className="border rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Tưới nước</h3>
            <BaseLineChart data={data} color={CHART_COLOR[TypeCard.WATERING]} unit=" lần" />{" "}
        </div>
    );
}
