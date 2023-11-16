const { Telegraf } = require('telegraf');
const firebase = require('../database/config');
const { sendEmailValidateCode } = require('./emailCtrl');
const { commandArgs } = require('../middlewares/telegraf-params');

const timeDelayTyping = 1.5;

let regexEmail = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

// * Assign token to the bot
const bot = new Telegraf(process.env.TOKEN_BOT);

// * Middleware to get the command args
bot.use(commandArgs());

// * Commands that can be used with the bot (no login required)
bot.start((ctx) => {
    ctx.reply('¡Bienvenido humano, al bot de notificaciones oficial de Kinnil! 😎\nUtiliza el comando /ayuda para obtener los comandos disponibles.');
});

bot.command('ayuda', (ctx) => {
    ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
    ctx.reply('Nota: Ten en cuenta que debes de estar registrado en el sistema para poderte dar de alta en las notificaciones\n\n/validar <correo> - Se mandará un correo electrónico a tu mail con un código de verificación para darte de alta correctamente\n\n/vincular <correo> <código> - Se validará tu correo electrónico con el código de verificación que mandes para darte de alta correctamente y recibir notificaciones\n\n/desvincular <correo> <"CONFIRMAR"> - Se dará de baja de manera automática e instantáneamente del sistema de alertas, validando tus datos proporcionados\n\n/estatus - Te dirá si están activas las notificaciones en tu cuenta');
});

bot.command('validar', async (ctx) => {
    bot.telegram.sendChatAction(ctx.message.from.id, 'typing');

    const params = ctx.state.command.args;
    let dataUser = null;

    // * Valida que si haya mandado parámetros
    if (params.length === 0 || params.length > 1) {
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('Por favor ingrese un correo 🧐');
    }

    if (!regexEmail.test(params[0])) {
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('Por favor ingrese un correo válido 🤨');
    }

    let email = [`${params[0]}`];
    const userCode = Math.floor(Math.random() * 1000) + 10000;

    try {
        // * Consulta la información del usuario
        dataUser = await firebase.db.collection('usuarios').where('email', '==', params[0]).where('activo', '==', true).limit(1).get();

        if (dataUser.empty) {
            ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
            return ctx.reply('No es posible habilitar las notificaciones en su cuenta 👀');
        }

        if (dataUser.docs[0].data().verificationCodeEnable !== undefined && dataUser.docs[0].data().verificationCodeEnable !== null) {
            ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
            return ctx.reply('Ya cuentas con una validación pendiente 🙄');
        }

        if (dataUser.docs[0].data().notifications) {
            ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
            return ctx.reply('Ya tienes las notificaciones encendidas 🤭');
        }
    } catch (error) {
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('No hemos podido consultar tu información, por favor inténtelo de nuevo 🤡');
    }

    try {
        // * Insertamos el código en el registro del usuario
        dataUser.forEach(async (data) => {
            data.ref.update({
                verificationCodeEnable: userCode
            });
        });
    } catch (error) {
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('No hemos podido resguardar su código, por favor inténtelo de nuevo 🤡');
    }

    try {
        // * Envía el código de verificación
        await sendEmailValidateCode({
            from: 'Código de verificación para KinnilBot',
            recipients: email,
            subject: 'Este es su código de verificación para dar de alta las notificaciones',
            message: 'Se ha generado su código de verificación para recibir notificaciones',
            code: userCode
        });
    } catch (error) {
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('Ha ocurrido un error al procesar su solicitud 🥺');
    }

    // * Eliminamos el mensaje que el usuario mando
    await delayTime(async () => {
        ctx.reply('Se ha mandado su código de verificación al correo proporcionado 🥳');
    }, timeDelayTyping);

    ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
});

bot.command('vincular', async (ctx) => {
    bot.telegram.sendChatAction(ctx.message.from.id, 'typing');

    const params = ctx.state.command.args;
    let dataUser = null;

    // * Valida que si haya mandado parámetros
    if (params.length === 0 || params.length > 2) {
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('Por favor ingrese los datos solicitados 🧐');
    }

    if (!regexEmail.test(params[0])) {
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('Por favor ingrese un correo válido 🤨');
    }

    try {
        // * Consulta la información del usuario
        dataUser = await firebase.db.collection('usuarios').where('email', '==', params[0]).where('verificationCodeEnable', '==', parseInt(params[1])).limit(1).get();

        if (dataUser.empty) {
            ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
            return ctx.reply('No fue posible habilitar las notificaciones en su cuenta 👀');
        }
    } catch (error) {
        console.log(error);
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('No hemos podido consultar tu información, por favor inténtelo de nuevo 🤡');
    }

    try {
        // * Habilitamos las notificaciones
        dataUser.forEach(async (data) => {
            data.ref.update({
                verificationCodeEnable: null,
                notifications: true,
                telegramChatId: ctx.message.from.id
            });
        });
    } catch (error) {
        console.log(error);
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('No hemos podido consultar tu información, por favor inténtelo de nuevo 🤡');
    }

    // * Eliminamos el mensaje que el usuario mando
    await delayTime(async () => {
        ctx.reply('Se han habilitado las notificaciones en su cuenta 🔔');
    }, timeDelayTyping);

    ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
});

bot.command('desvincular', async (ctx) => {
    bot.telegram.sendChatAction(ctx.message.from.id, 'typing');

    const params = ctx.state.command.args;
    let dataUser = null;

    // * Valida que si haya mandado parámetros
    if (params.length === 0 || params.length > 2) {
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('Por favor ingrese los datos solicitados 🧐');
    }

    if (params[1] !== 'CONFIRMAR') {
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('Por favor escriba la palabra correctamente 🤨');
    }

    try {
        // * Consulta la información del usuario
        dataUser = await firebase.db.collection('usuarios').where('email', '==', params[0]).where('telegramChatId', '==', ctx.message.from.id).limit(1).get();

        if (dataUser.empty) {
            ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
            return ctx.reply('No fue posible deshabilitar las notificaciones en su cuenta 👀');
        }
    } catch (error) {
        console.log(error);
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('No hemos podido consultar tu información, por favor inténtelo de nuevo 🤡');
    }

    try {
        // * Deshabilitamos las notificaciones
        dataUser.forEach(async (data) => {
            data.ref.update({
                notifications: false
            });
        });
    } catch (error) {
        console.log(error);
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('No hemos podido deshabilitar las notificaciones, por favor inténtelo de nuevo 🤡');
    }

    // * Eliminamos el mensaje que el usuario mando
    await delayTime(async () => {
        ctx.reply('Se han deshabilitado las notificaciones en su cuenta 🔕');
    }, timeDelayTyping);

    ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
});

bot.command('estatus', async (ctx) => {
    bot.telegram.sendChatAction(ctx.message.from.id, 'typing');

    let dataUser = null;

    try {
        // * Consulta la información del usuario
        dataUser = await firebase.db.collection('usuarios').where('telegramChatId', '==', ctx.message.from.id).limit(1).get();

        if (dataUser.empty) {
            ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
            return ctx.reply('No fue posible completar la solicitud 👀');
        }

        if (dataUser.docs[0].data().notifications) {
            ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
            return ctx.reply('Ya tienes las notificaciones encendidas 🤭');
        } else {
            ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
            return ctx.reply('No tienes las notificaciones encendidas 🥺');
        }
    } catch (error) {
        ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
        return ctx.reply('No hemos podido consultar tu información, por favor inténtelo de nuevo 🤡');
    }
});

bot.on('text', async (ctx) => {
    ctx.telegram.deleteMessage(ctx.message.from.id, ctx.message.message_id);
});

const botStart = async () => {
    bot.launch();
    console.log(`${(await bot.telegram.getMe()).username} is started`);
    return bot;
};

// * Method for create a delay of time
const delayTime = async (myFunction, time) => setTimeout(myFunction, time * 1000);

module.exports = {
    botStart
};
