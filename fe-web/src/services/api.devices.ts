import { apiService } from "./apiConfig";

export const fetchMetricSensor = async ({ time, mac }: { time: string; mac: string }) => {
    try {
        const response = await apiService.get<{ data: any }>(
            "/device" + "/" + mac + "/history" + "?range=" + time,
        );
        return response.data;
    } catch (err) {
        console.log(err);
        return null;
    }
};
