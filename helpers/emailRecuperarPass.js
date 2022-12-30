import nodemailer from 'nodemailer';

const emailRecuperarPass = async (datos) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    // Enviar el email
    const { email, nombre, token } = datos;
    const info = await transporter.sendMail({
        from: 'APV - Administrador de Pacientes de Veterinaria',
        to: email,
        subject: 'Reestablece tu contraseña (APV)',
        text: 'Reestablece tu contraseña (APV)',
        html: `
            <p>Hola ${nombre}, has solicitado reestablecer tu contraseña.</p>
            <p>Sigue el siguiente enlace para recuperar tu contraseña: 
                <a href="${process.env.FRONTEND_URL}/recuperar-password/${token}">Recuperar Contraseña</a>
            </p>
            <p>Importante: si tú no solicitaste la recuperación, puedes ignorar este mensaje.</p>
        `
    });

    console.log("Mensaje enviado: %s", info.messageId);
}

export default emailRecuperarPass;