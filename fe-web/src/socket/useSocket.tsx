import { useEffect, useRef } from "react";
import { Socket as SocketType } from "socket.io-client";
import Socket from "./socketConfig";

/**
 * Accepts a function that contains multiple listeners to socket of your app.
 *
 * @param listener Define your listeners in here
 * @param deps If present, effect will only activate if the values in the list change.
 * @param disconnect use this when you want to disconnect to socket on component unmount from DOM
 */

const useSocket = ({
    namespace,
    listener,
    deps,
    disconnect = false,
    returnFc,
}: {
    namespace: string;
    listener: (socket: SocketType) => void;
    deps?: Array<unknown>;
    disconnect?: boolean;
    returnFc?: Function;
}): void => {
    const socketRef = useRef<SocketType | null>(null);
    const savedListener = useRef(listener);

    useEffect(() => {
        savedListener.current = listener;
    }, [listener]);

    useEffect(() => {
        const connectSocket = async () => {
            let socket = Socket.getInstant(namespace);

            if (!socket) {
                console.log("log socket not found");
                return;
            }

            socketRef.current = socket;

            if (!socket.connected) {
                // Wait for socket to connect
                await new Promise((resolve) => {
                    socket.once("connect", () => {
                        resolve(true);
                    });
                });
            }

            console.log("socket connect successfully");
            savedListener.current && savedListener.current(socket);
        };

        connectSocket();

        return () => {
            if (disconnect && socketRef.current) {
                console.log("log disconnect socket");
                socketRef.current.disconnect();
                returnFc && returnFc();
            }
        };
    }, [disconnect, ...(deps ?? [])]);
};

export default useSocket;
