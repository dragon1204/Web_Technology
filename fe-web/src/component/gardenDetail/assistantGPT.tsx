import { Bot } from "lucide-react";

export function AIAssistant({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2 p-3 bg-gray-100 rounded-lg shadow-sm w-full">
            {/* AI icon */}
            <div className="text-blue-500">
                <Bot size={24} />
            </div>

            {/* Comment text */}
            <div className="text-gray-700 text-sm">{text}</div>
        </div>
    );
}
interface SmartNoteListProps {
    notes: string;
}

// Usage example
const notes = [
    "Sản phẩm Smart Garden có thiết kế đẹp và dễ sử dụng.",
    "Tưới nước tự động hoạt động ổn định, nhưng có thể cải thiện về thời gian phản hồi.",
    "Giao diện dashboard trực quan, dễ xem các chỉ số môi trường.",
    "Cần bổ sung cảnh báo lỗi khi thiết bị offline.",
];

// <SmartNoteList notes={notes} />
