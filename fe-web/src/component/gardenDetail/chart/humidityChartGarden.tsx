import { CHART_COLOR } from "@/types/chart.type";
import { TypeCard } from "@/types/cards.type";
import BaseLineChart from "@/component/dashboard/chart/lineChart";
import { AIAssistant } from "../assistantGPT";

export default function HumidityChartGarden({ data }: { data: { time: string; value: number }[] }) {
    const text =
        "Độ ẩm đất hiện tại khá ổn, giữ được lượng nước phù hợp cho cây trồng. Nên theo dõi đều đặn để tránh quá ẩm hoặc khô hạn.";

    return (
        <div className="border rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Độ ẩm của đất</h3>
            <BaseLineChart data={data} color={CHART_COLOR[TypeCard.HUMIDITY_SOIL]} unit="%" />{" "}
            <AIAssistant text={text} />
        </div>
    );
}
