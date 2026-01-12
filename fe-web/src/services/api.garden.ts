import { GardenResponseFetch, GardenState } from "@/types/garden.type";
import { apiService } from "./apiConfig";

export const getGardenData = async ({
    page = 1,
    limit = 10,
    sortBy,
    order = "desc",
    search,
    searchFields,
}: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "asc" | "desc";
    search?: string;
    searchFields?: string[];
}) => {
    try {
        const params = new URLSearchParams();

        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (sortBy) params.append("sortBy", sortBy);
        if (order) params.append("order", order);
        if (search) params.append("search", search);
        if (searchFields && searchFields.length > 0) {
            searchFields.forEach((field) => params.append("searchFields", field));
        }
        const response = await apiService.get<{
            data: GardenResponseFetch & { items: GardenState[] };
        }>(`/garden?${params.toString()}`);
        return {
            gardens: response?.data?.items || [],
            total: response?.data?.total || 0,
            page: response?.data?.page || 0,
            limit: response?.data?.limit || 0,
            totalPages: response?.data?.totalPages || 0,
        };
    } catch (err) {
        console.log("Error fetching garden data: ", err);
        return null;
    }
};

export const postCeateGarden = async ({ userId, name }: { userId: number; name: string }) => {
    try {
        const response = await apiService.post<{ data: GardenState }>(`garden?userId=${userId}`, {
            name,
        });
        return {
            id: response.data.id,
            name: response.data.name,
            ownerId: response.data.ownerId,
            deviceMac: response.data.deviceMac || null,
            temperature: response.data.temperature || 0,
            humidity: response.data.humidity || 0,
            soil: response.data.soil || 0,
            timestamp: response.data.timestamp || "",
            pumpControl: response.data.pumpControl || "AUTO",
            vegetables: [],
            sales: [],
        };
    } catch (err) {
        console.log("Create garden error: ", err);
        return null;
    }
};

export const getGardenDetail = async ({ gardenId }: { gardenId: string }) => {
    try {
        const response = await apiService.get<{ data: GardenState }>("/garden" + "/" + gardenId);
        return response.data;
    } catch (err) {
        console.log("Get garden detail error");
        return null;
    }
};

export const deleteGarden = async ({ gardenId }: { gardenId: string }) => {
    try {
        const response = await apiService.delete<{
            data: GardenState;
        }>("/garden" + "/" + gardenId);
        return response.data;
    } catch (err) {
        console.log(err);
        return null;
    }
};
