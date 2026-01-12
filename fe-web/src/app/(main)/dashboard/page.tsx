"use client";

import RecentActivities from "@/component/dashboard/activity/recentActivities";
import CardDashboard from "@/component/dashboard/cardDashboard/carDashboard";
import ChartSection from "@/component/dashboard/chartSection/chartSection";

const DashBoard: React.FC = () => {
    return (
        <div className="grid gap-4">
            <CardDashboard />
            <ChartSection />
            <RecentActivities />
        </div>
    );
};

export default DashBoard;
