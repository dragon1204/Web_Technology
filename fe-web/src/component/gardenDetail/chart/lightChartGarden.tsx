import { CHART_COLOR } from "@/types/chart.type";
import { TypeCard } from "@/types/cards.type";
import BaseLineChart from "@/component/dashboard/chart/lineChart";
import { AIAssistant } from "../assistantGPT";

export default function SoilChartGarden({ data }: { data: { time: string; value: number }[] }) {
    const text = "Mức ẩm của đất đủ cho sự phát triển của cây.";

    return (
        <div className="border rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Độ ẩm trong đất</h3>
            <BaseLineChart data={data} color={CHART_COLOR[TypeCard.LIGHT]} unit="ADC" />{" "}
            <AIAssistant text={text} />
        </div>
    );
}
