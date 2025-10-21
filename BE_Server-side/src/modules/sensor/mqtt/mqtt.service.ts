import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { WsGateway } from '../websocket/websocket.gateway';





@Injectable()
export class MqttService implements OnModuleInit{
    private client : mqtt.MqttClient;

    constructor(private readonly wsGateway : WsGateway){}

    onModuleInit() {
        this.client = mqtt.connect('mqtt://broker.hivemq.com:1883');

        this.client.on('connect', () => {
            console.log("MQTT connected");
            this.client.subscribe(['humidity', 'temperature']);
        });

        this.client.on('message', (topic, message) => {
            const payload = message.toString();
            if(topic === 'humidity') {
                console.log('Humidity:', payload);
                this.wsGateway.sendData( 'humidity', payload);
            }

            if(topic === 'temperature') {
                console.log('Temperature:', payload);
                this.wsGateway.sendData( 'temperature', payload);
            }


        })


    }
}
