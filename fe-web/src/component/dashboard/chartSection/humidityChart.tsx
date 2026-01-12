import { CHART_COLOR } from "@/types/chart.type";
import BaseLineChart from "../chart/lineChart";
import { TypeCard } from "@/types/cards.type";

export default function HumidityChart() {
    const data = [
        { time: "06:00", value: 85 },
        { time: "09:00", value: 78 },
        { time: "12:00", value: 70 },
        { time: "15:00", value: 65 },
        { time: "18:00", value: 72 },
    ];

    return (
        <div className="border rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Độ ẩm của đất</h3>
            <BaseLineChart data={data} color={CHART_COLOR[TypeCard.HUMIDITY_SOIL]} unit="%" />{" "}
        </div>
    );
}
