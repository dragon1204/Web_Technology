import { CHART_COLOR } from "@/types/chart.type";
import BaseLineChart from "../chart/lineChart";
import { TypeCard } from "@/types/cards.type";

export default function TemperatureChart() {
    const data = [
        { time: "06:00", value: 25 },
        { time: "09:00", value: 28 },
        { time: "12:00", value: 32 },
        { time: "15:00", value: 33 },
        { time: "18:00", value: 30 },
    ];

    return (
        <div className="border rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Nhiệt độ</h3>
            <BaseLineChart data={data} color={CHART_COLOR[TypeCard.TEMPERATURE]} unit="°C" />{" "}
        </div>
    );
}
