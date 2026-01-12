// DateFilter.tsx
"use client";

import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";

interface Props {
    value: Dayjs;
    onChange: (date: Dayjs) => void;
}

const DateFilter = ({ value, onChange }: Props) => {
    return <DatePicker value={value} onChange={(d) => d && onChange(d)} size="small" />;
};

export default DateFilter;
