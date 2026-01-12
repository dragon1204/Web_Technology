import { setSensorMetric } from "@/redux/slice/garden.slice";
import { RootState, useAppSelector } from "@/redux/store";
import useSocket from "@/socket/useSocket";
import { useDispatch } from "react-redux";

export default function GardenListen() {
    const dispatch = useDispatch();
    const { deviceMac } = useAppSelector((state: RootState) => state.gardens.gardenDetail);

    useSocket({
        namespace: "devices",
        listener: (socket) => {
            socket.on("iot/sensor", (response: any) => {
                dispatch(setSensorMetric(response));
                console.log("data: ", response);
            });
        },
    });
    return null;
}
// function setSensorMetric(arg0: number): any {
//     throw new Error("Function not implemented.");
// }
