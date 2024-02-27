const express = require('express')
const cors = require('cors');

const fs = require('fs');
const util = require('util');

/**
 * * Clase para inicializar el servidor con su configuración
 *
 * @class Server
 */
class Server {
    constructor() {
        // * Express
        this.app = express();

        // * Puerto
        this.port = process.env.PORT;

        // * Path para usuarios
        this.usuariosPath = '/api/usuarios';
        this.quectelPath = '/api/quectel';

        // * Middlewares
        this.middlewares();

        // * Rutas
        this.routes();

        // * Log in the server
        this.initLog();

        // * Controllers
        this.controllers();
    }

    // * Método para inicializar los controladores que no usen rutas
    controllers() {
        require('../controllers/truckAlertsCtrl');
    }

    // * Método para inicializar el log
    initLog() {
        const date = new Date();
        let dateString = date.toLocaleDateString();
        let timeString = date.toLocaleTimeString();
        
        timeString = timeString.replace(/:/g, '-');
        timeString = timeString.replace(/ /g, '');
        dateString = dateString.replace(/\//g, '-');

        const log_file = fs.createWriteStream(__dirname + `/../logs/${dateString}_${timeString}.log`, { flags: 'w' });
        const log_stdout = process.stdout;

        console.log = function (d, ...args) {
            log_file.write(util.format(d, ...args) + '\n');
            log_stdout.write(util.format(d, ...args) + '\n');
        };
    }

    // * Método para inicializar las rutas
    routes() {
        this.app.use(this.usuariosPath, require('../routes/usuariosRoute'));
        //this.app.use(this.quectelPath, require('../routes/quectelRoute'));
        require('../routes/iotCoreRoute');
    }

    // * Método para inicializar el servidor
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server corriendo en puerto: ${this.port}`);
        });
    }

    // * Método para inicializar los middlewares
    middlewares() {
        // * CORS
        this.app.use(cors());
        // * Lectura y parseo del body
        this.app.use(express.json());
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*")
            res.header("Access-Control-Allow-Headers", "Authorization")
            next()
        });
    }
}

module.exports = Server;