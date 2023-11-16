const { createTransport } = require("nodemailer");

// * Create reusable transporter object using the default SMTP transport
const transporter = createTransport({
    service: "gmail",
    auth: {
        user: "notificaciones@pidelectronics.com",
        pass: "pidelectronics1818",
    },
});

exports.sendEmail = (paramsMail, truckData) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: paramsMail.from, // sender address
            to: paramsMail.recipients, // list of receivers
            subject: paramsMail.subject, // Subject line
            text: paramsMail.message, // plain text body
            html: `
            <!doctype html>
            <html lang="en-US">

            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <title>Reestablecer Contraseña</title>
                <meta name="description" content="Reestablecer Contraseña.">
                <style type="text/css">
                    a:hover {
                        text-decoration: underline !important;
                    }
                </style>
            </head>

            <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #343a40; height: 100vh;"
                leftmargin="0">
                <!--100% body table-->
                <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#343a40"
                    style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                    <tr>
                        <td>
                            <table style="background-color: #343a40; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="text-align:center;">
                                        <a href="https://www.kinnil.com/" title="logo" target="_blank">
                                            <img width="400"
                                                src="https://firebasestorage.googleapis.com/v0/b/kinnil-feat-cedar.appspot.com/o/kinnil.png?alt=media&token=3e3cb64d-0b2a-4068-888d-ee37a4e2033d"
                                                title="logo" alt="logo">
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                            style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:0 35px;">
                                                    <h1
                                                        style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
                                                        Correo para notificar alerta
                                                    </h1>
                                                    <span
                                                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        Se ha detectado una alerta en el sistema de:
                                                        <br>
                                                        ${ paramsMail.message }
                                                    </p>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        Favor de verificarlo en el sistema y comunicarse con el operador de la maquina.
                                                        <br>
                                                    </p>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        Equipo de PID Electronics
                                                    </p>
                                                    <a href="${ '' }"
                                                        style="background:#343a40;text-decoration:none !important; font-weight:500; margin-top:35px; color:#0ddea1;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">
                                                        Entrar al sistema
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="text-align:center;">
                                        <p style="font-size:14px; color:#0ddea1; line-height:18px; margin:0 0 0;">
                                            &copy; <strong>PID ELECTRONICS</strong></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>

            </html>
            `, // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Ha ocurrido un error al enviar correo electronico", error);
                reject(error);
            }

            console.log("Email enviado con exito, destinatario: " + paramsMail.recipients);
            resolve();
        });
    });
};

exports.sendEmailValidateCode = (paramsMail, truckData) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: paramsMail.from, // sender address
            to: paramsMail.recipients, // list of receivers
            subject: paramsMail.subject, // Subject line
            text: paramsMail.message, // plain text body
            html: `
            <!doctype html>
            <html lang="en-US">

            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <title>Reestablecer Contraseña</title>
                <meta name="description" content="Reestablecer Contraseña.">
                <style type="text/css">
                    a:hover {
                        text-decoration: underline !important;
                    }
                </style>
            </head>

            <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #343a40; height: 100vh;"
                leftmargin="0">
                <!--100% body table-->
                <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#343a40"
                    style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                    <tr>
                        <td>
                            <table style="background-color: #343a40; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="text-align:center;">
                                        <a href="https://www.kinnil.com/" title="logo" target="_blank">
                                            <img width="400"
                                                src="https://firebasestorage.googleapis.com/v0/b/kinnil-feat-cedar.appspot.com/o/kinnil.png?alt=media&token=3e3cb64d-0b2a-4068-888d-ee37a4e2033d"
                                                title="logo" alt="logo">
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                            style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:0 35px;">
                                                    <h1
                                                        style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
                                                        Código de verificación para notificaciones 
                                                    </h1>
                                                    <span
                                                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        Su código de verificación es:
                                                        <br>
                                                        ${ paramsMail.code }
                                                    </p>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        Ingresa este código de verificación con tu correo en nuestro bot para continuar.
                                                        <br>
                                                    </p>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        Equipo de PID Electronics
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="text-align:center;">
                                        <p style="font-size:14px; color:#0ddea1; line-height:18px; margin:0 0 0;">
                                            &copy; <strong>PID ELECTRONICS</strong></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>

            </html>
            `, // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Ha ocurrido un error al enviar correo electronico", error);
                reject(error);
            }

            console.log("Email enviado con exito, destinatario: " + paramsMail.recipients);
            resolve();
        });
    });
};
