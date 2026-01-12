import { CHART_COLOR } from "@/types/chart.type";
import { TypeCard } from "@/types/cards.type";
import BaseLineChart from "@/component/dashboard/chart/lineChart";
import { AIAssistant } from "../assistantGPT";

export default function TemperatureChartGarden({
    data,
}: {
    data: { time: string; value: number }[];
}) {
    const text =
        "Nhiệt độ trong garden đang duy trì ổn định. Nếu nhiệt độ tăng quá mức, cân nhắc che nắng hoặc điều chỉnh hệ thống làm mát.";

    return (
        <div className="border rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Nhiệt độ</h3>
            <BaseLineChart data={data} color={CHART_COLOR[TypeCard.TEMPERATURE]} unit="°C" />{" "}
            <AIAssistant text={text} />
        </div>
    );
}
