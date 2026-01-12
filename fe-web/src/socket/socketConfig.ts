import { Socket as TSocket, io } from "socket.io-client";
// import { NAME_SPACE } from "../../../shared/utils/socket.namespace";

// Singleton
interface ISocketInstance {
    namespace: string;
    instance: TSocket;
}
export default class Socket {
    private static instances: ISocketInstance[];

    constructor(namespace: string) {
        const instances = Socket.instances ?? [];
        let isConnect = true;
        const socketInstance = io(`${process.env.NEXT_PUBLIC_SOCKET_API}/${namespace}`, {
            path: "/socket",
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
        });

        socketInstance.on("connect_error", (err) => {
            console.log("connect_error", err);
            isConnect = false;
        });
        socketInstance.on("connect_failed", (err, details) => {
            console.log("connect_failed", err, details);
            isConnect = false;
        });
        socketInstance.on("disconnect", (err, details) => {
            console.log("disconnect", err, details);
            instances.forEach((e) => {
                e.instance.disconnect();
                e.instance.removeAllListeners();
            });
            Socket.instances = [];
            isConnect = false;
        });

        if (isConnect) {
            instances.push({
                namespace: namespace,
                instance: socketInstance,
            });
        }
        Socket.instances = instances;
    }

    static getInstant(namespace: string) {
        if (
            !Socket.instances ||
            Socket.instances?.length === 0 ||
            Socket.instances.findIndex((e) => e.namespace === namespace) < 0
        ) {
            new Socket(namespace);
        }
        let namespaceFind = namespace;
        const instance = Socket.instances.find((ele) => ele?.namespace === namespaceFind)?.instance;
        return instance;
    }
}
