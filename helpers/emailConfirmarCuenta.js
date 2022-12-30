import nodemailer from 'nodemailer';

const emailConfirmarCuenta = async (datos) => {
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
        subject: 'Confirma tu cuenta APV',
        text: 'Confirma tu cuenta APV',
        html: `
            <p>Hola ${nombre}, debes confirmar tu cuenta APV.</p>
            <p>Tu cuenta ya está creada, solo debes confirmarla con el siguiente enlace: 
                <a href="${process.env.FRONTEND_URL}/confirmar-cuenta/${token}">Confirmar Cuenta</a>
            </p>
            <p>Importante: si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>
        `
    });

    console.log("Mensaje enviado: %s", info.messageId);
}

export default emailConfirmarCuenta;