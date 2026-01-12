type PumpAction = "ON" | "OFF" | "AUTO";

interface PumpControlSelectProps {
    value: PumpAction;
    onChange: (value: PumpAction) => void;
}

export function PumpControlSelect({ value, onChange }: PumpControlSelectProps) {
    const options: PumpAction[] = ["OFF", "AUTO", "ON"];

    const getStyle = (option: PumpAction) => {
        if (value === option) {
            switch (option) {
                case "ON":
                    return "bg-green-600 text-white border-green-600";
                case "OFF":
                    return "bg-red-600 text-white border-red-600";
                case "AUTO":
                    return "bg-yellow-500 text-white border-yellow-500";
            }
        }
        return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300";
    };

    return (
        <div className="inline-flex rounded-lg overflow-hidden border">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    disabled={value === option}
                    className={`px-4 py-2 text-sm font-medium transition ${getStyle(
                        option,
                    )} disabled:opacity-70`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
