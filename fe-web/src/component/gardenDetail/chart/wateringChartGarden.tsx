import { CHART_COLOR } from "@/types/chart.type";
import { TypeCard } from "@/types/cards.type";
import BaseLineChart from "@/component/dashboard/chart/lineChart";
import { AIAssistant } from "../assistantGPT";

export default function WateringChartGarden({ data }: { data: { time: string; value: number }[] }) {
    const text =
        "Hệ thống tưới nước hoạt động hiệu quả, tần suất phù hợp. Nên kiểm tra định kỳ để đảm bảo các van và béc phun không bị tắc.";

    return (
        <div className="border rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Tưới nước</h3>
            <BaseLineChart data={data} color={CHART_COLOR[TypeCard.WATERING]} unit=" lần" />{" "}
            <AIAssistant text={text} />
        </div>
    );
}
