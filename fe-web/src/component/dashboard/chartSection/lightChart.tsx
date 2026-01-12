import { CHART_COLOR } from "@/types/chart.type";
import BaseLineChart from "../chart/lineChart";
import { TypeCard } from "@/types/cards.type";

export default function LightChart() {
    const data = [
        { time: "06:00", value: 120 },
        { time: "09:00", value: 600 },
        { time: "12:00", value: 950 },
        { time: "15:00", value: 700 },
        { time: "18:00", value: 300 },
    ];

    return (
        <div className="border rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Mức độ ánh sáng</h3>
            <BaseLineChart data={data} color={CHART_COLOR[TypeCard.LIGHT]} unit="lx" />{" "}
        </div>
    );
}
