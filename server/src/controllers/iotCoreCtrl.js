const express = require('express');
const app = express();
const { createServer } = require('http');
const socketServer = createServer(app);
const { Server } = require("socket.io");
const io = new Server(socketServer, {
    cors: {
        origin: '*',
    },
});

const path = require('path');
const iot_sdk = require('aws-iot-device-sdk-v2');
const mqtt = iot_sdk.mqtt
const TextDecoder = require('util').TextDecoder;
const aws_crt = require('aws-crt');
const iot = aws_crt.iot;
const mqtt_crt = aws_crt.mqtt;

const iotCoreServer = async () => {
    const decoder = new TextDecoder('utf-8');

    const topics = [
        'web_to_server',
        'board_to_server',
        'server_to_webs',
        'server_to_boards'
    ];

    const certificate = path.join(__dirname, '/../keys', 'Kinnil-CEDAR-Server.cert.pem');
    const privateKey = path.join(__dirname, '/../keys', 'Kinnil-CEDAR-Server.private.key');
    const rootCA = path.join(__dirname, '/../keys', 'root-CA.crt');
    const clientID = 'kinnil-cedar-server';
    const endPoint = 'a10f56wrztvksb-ats.iot.us-east-2.amazonaws.com';

    const config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(certificate, privateKey);

    config_builder.with_certificate_authority_from_path(undefined, rootCA);

    config_builder.with_clean_session(false);
    config_builder.with_client_id(clientID);
    config_builder.with_endpoint(endPoint);

    const connection = new mqtt_crt.MqttClient().new_connection(config_builder.build());

    await connection.connect().catch((error) => console.log("Connect error: " + error));

    // * Método para escuchar las conexiones de los clientes
    io.on('connection', (socket) => {
        console.log(`User connected with id: ${socket.id}`);

        // * Método para escuchar los mensajes de los clientes
        socket.on(topics[0], async (message) => {
            console.log("Received from web", message);
            
            // * Se notifica a los tablillas
            await connection.publish(topics[3], message, mqtt.QoS.AtLeastOnce);
            console.log("Message sent to boards");
        });
    });

    // * Método para escuchar los mensajes de las tablillas
    await connection.subscribe(topics[1], mqtt.QoS.AtLeastOnce, async (topic, payload, dup, qos, retain) => {
        const data = JSON.parse(decoder.decode(payload));
        console.log("Received from", topic, data);

        // ! Aquí se debe de mandar a guardar a la base de datos

        // * Se notifica a la webs
        io.emit(topics[2], data);
    });
};

module.exports = {
    iotCoreServer,
    socketServer
}