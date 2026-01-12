"use client";

import { useParams } from "next/navigation";
import { GardenDeviceMap } from "@/component/gardenDetail/gardenDeviceMap";
import MetricCardsSection from "@/component/gardenDetail/metricCardsSection";
import MetricChartSection from "@/component/gardenDetail/metricChartsSection";
import { useEffect } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { gardenInfo } from "@/redux/async-thunk/garden-async";
import NewGarden from "@/component/gardenDetail/newGarden/newGarden";
import NewGardenListener from "@/component/gardenDetail/newGarden/gardenListener";
import GardenListen from "@/component/gardenDetail/gardenListener";

export default function GardenDetail() {
    const dispatch = useAppDispatch();
    const { gardens, gardenDetail } = useAppSelector((state: RootState) => state.gardens);
    const params = useParams<{ garden_id: string }>();
    const gardenId = params.garden_id;

    useEffect(() => {
        if (gardenId) {
            dispatch(gardenInfo({ gardenId }));
        }
    }, [gardenId]);

    if (!gardenDetail.deviceMac || gardenDetail.deviceMac.trim() === "") {
        return (
            <>
                <NewGardenListener />
                <NewGarden />
            </>
        );
    }

    return (
        <div>
            <GardenListen />
            <MetricCardsSection />
            <MetricChartSection />
            <GardenDeviceMap />
        </div>
    );
}
