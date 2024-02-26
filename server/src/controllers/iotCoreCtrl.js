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

// * Modelo de datos del quectel
const { saveDataPLC } = require('../models/plcModel');

let tempBoards = {};

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

        // ! Parche por error de Firmware
        data.st_s1 = data.st_s1.toUpperCase();
        data.st_s2 = data.st_s2.toUpperCase();
        data.st_s3 = data.st_s3.toUpperCase();

        if (tempBoards[data.idBoard] === undefined) {
            console.log('New data from board, saving');
            tempBoards[data.idBoard] = data;
            // * Se guarda en la base de datos
            await saveDataPLC(data);
            // * Se notifica a la webs
            io.emit(topics[2], data);
            return;
        }

        if (JSON.stringify(tempBoards[data.idBoard]) === JSON.stringify(data)) {
            console.log('The data is the same, nothing saved');
            return;
        }

        console.log('The data is different, saving new data');
        tempBoards[data.idBoard] = data;
        // * Se guarda en la base de datos
        await saveDataPLC(data);
        // * Se notifica a la webs
        io.emit(topics[2], data);
    });

    /*setInterval(async () => {
        console.log('Sending random data');
        let r_ftMin = Math.floor(Math.random() * (10000 - 0 + 1)) + 0;
        let r_RPM = Math.floor(Math.random() * (10000 - 0 + 1)) + 0;

        let data = {
            id: "eth_iot_0001",
            type: "status",                // status" --> all variables status
            plc_st: "PLUGGED",             // PLUGGED" --> PLC is plugged to board, "UNPLUGGED" --> PLC is unplugged
            plc_conn: true,                // rue --> board is connected to modbus PLC correctly, false -> modbus error
            ftmin: 0,              // ands speeed in ft/min 
            rpm: 0,                // ands speed in RPM´s
            bands: "STOPPED",           // RUNNING" --> bands are running, "STOPPED" --> bands are stopped
            st_s1: "CLOSED",             // OPEN" --> silo 1 is open, "CLOSED" --> silo 1 is closed
            st_s2: "CLOSED",           // OPEN" --> silo 2 is open, "CLOSED" --> silo 2 is closed
            st_s3: "CLOSED",           // OPEN" --> silo 3 is open, "CLOSED" --> silo 3 is closed
            p_s1: 0,             // OPEN" --> silo 1 is open, "CLOSED" --> silo 1 is closed
            p_s2: 0,           // OPEN" --> silo 2 is open, "CLOSED" --> silo 2 is closed
            p_s3: 0,  
            mtto: "OFF",             // OFF" --> alert not triggered, "ON" --> alert triggered
            al_1: "OK"
        };

        await saveDataPLC(data);

        r_ftMin = Math.floor(Math.random() * (10000 - 0 + 1)) + 0;
        r_RPM = Math.floor(Math.random() * (10000 - 0 + 1)) + 0;
        data.id = "eth_iot_0001";
        data.ftmin = r_ftMin;
        data.rpm = r_RPM;
        await saveDataPLC(data);

        r_ftMin = Math.floor(Math.random() * (10000 - 0 + 1)) + 0;
        r_RPM = Math.floor(Math.random() * (10000 - 0 + 1)) + 0;
        data.id = "eth_iot_0002";
        data.ftmin = r_ftMin;
        data.rpm = r_RPM;
        await saveDataPLC(data);

        r_ftMin = Math.floor(Math.random() * (10000 - 0 + 1)) + 0;
        r_RPM = Math.floor(Math.random() * (10000 - 0 + 1)) + 0;
        data.id = "eth_iot_0003";
        data.ftmin = r_ftMin;
        data.rpm = r_RPM;
        await saveDataPLC(data);
    }, 5000);*/
};

module.exports = {
    iotCoreServer,
    socketServer
}