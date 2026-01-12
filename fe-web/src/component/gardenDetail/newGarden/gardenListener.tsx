//emit ack

import { setDeviceMac, setPairStatus } from "@/redux/slice/gardenRealTime.slice";
import { useAppDispatch } from "@/redux/store";
import useSocket from "@/socket/useSocket";

export default function NewGardenListener() {
    const dispatch = useAppDispatch();
    useSocket({
        namespace: "devices",
        listener: (socket) => {
            socket.on("iot/device/pair/timeout", (payload) => {
                console.log(payload);
            });
            socket.on("iot/device/pair/success", (payload) => {
                const { deviceMac } = payload;
                dispatch(setDeviceMac(deviceMac));
                dispatch(setPairStatus("success"));
            });
        },
    });
    return null;
}
