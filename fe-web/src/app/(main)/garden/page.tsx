"use client";

import MyGardenSection from "@/component/garden/gardenSection";
import { fetchGardens } from "@/redux/async-thunk/garden-async";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import React, { useEffect } from "react";

const MyGarden: React.FC = () => {
    const dispatch = useAppDispatch();
    const { gardens, page, totalPages, total, isloading } = useAppSelector(
        (state: RootState) => state.gardens,
    );

    const hasMore = page! < totalPages;

    // const loadMore = useCallback(() => {
    //     if (isloading) return;
    //     if (page! >= totalPages) return;

    //     dispatch(searchAsync.searchProducts(buildPayload(page! + 1)));
    // }, [isLoading, page, totalPages, q]);

    useEffect(() => {
        dispatch(fetchGardens({}));
    }, []);

    return (
        <div>
            <MyGardenSection />
        </div>
    );
};

export default MyGarden;
