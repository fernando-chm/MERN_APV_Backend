import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarToken from "../helpers/generarTokenUnico.js";
import emailConfirmarCuenta from "../helpers/emailConfirmarCuenta.js";
import emailRecuperarPass from "../helpers/emailRecuperarPass.js";

const registrar = async (req, res) => {
    const { email, nombre } = req.body;

    // Prevenir usuarios duplicados
    const existeUsuario = await Veterinario.findOne({email});
    if(existeUsuario) {
        const error = new Error('Usuario ya registrado'); // Se crea el error
        return res.status(400).json({msg: error.message}); // Se devuelve el mensaje de error en formato json para que el frontend pueda leerlo
    }

    try {
        const vet = new Veterinario(req.body); // Se crea una instancia del modelo Veterinario con los datos de la solicitud del cliente (req.body)
        const nuevoVet = await vet.save(); // Se guardan los datos en MongoDB

        // Enviar el email de confirmación de cuenta
        emailConfirmarCuenta({
            email,
            nombre,
            token: nuevoVet.token
        });

        res.json({nuevoVet}) // Respuesta al cliente
    } catch (error) {
        console.log(error);
    }
};

const perfil = (req, res) => {
    const { veterinario } = req;
    res.json(veterinario);
};

const confirmar = async (req, res) => {
    const { token } = req.params;
    const confirmarUsuario = await Veterinario.findOne({token});

    if(!confirmarUsuario) {
        const error = new Error("Token no válido");
        return res.status(404).json({msg: error.message});
    }

    try {
        confirmarUsuario.token = null;
        confirmarUsuario.confirmado = true;
        await confirmarUsuario.save();

        res.json({msg: 'Usuario confirmado correctamente'})
    } catch (error) {
        console.log(error);
    }
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;

    // Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email});
    if(!usuario) {
        const error = new Error("Usuario inexistente");
        return res.status(403).json({msg: error.message});
    }

    // Comprobar si la cuenta está confirmada
    if(!usuario.confirmado) {
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({msg: error.message});
    }

    // Revisar el password
    if(await usuario.comprobarPassword(password)){
        // Autenticar al usuario
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            jwtoken: generarJWT(usuario.id)
        });
    } else {
        const error = new Error("El password es incorrecto");
        return res.status(403).json({msg: error.message});
    }

};

const recuperarPassword = async (req, res) => {
    const { email } = req.body;
    const existeVet = await Veterinario.findOne({email});
    if(!existeVet) {
        const error = new Error("El usuario no existe");
        return res.status(400).json({msg: error.message});
    }

    try {
        existeVet.token = generarToken();
        await existeVet.save();

        // Enviar email con instrucciones para recuperar el password
        emailRecuperarPass({
            email,
            nombre: existeVet.nombre,
            token: existeVet.token
        });

        res.json({msg: "Hemos enviado un email con las instrucciones"});
    } catch (error) {
        console.log(error);
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const tokenValido = await Veterinario.findOne({token});

    if(tokenValido) {
        res.json({msg: "Token valido. El usuario existe."})
    } else {
        const error = new Error("Token no válido");
        return res.status(400).json({msg: error.message});
    }
}

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const veterinario = await Veterinario.findOne({token});
    if(!veterinario) {
        const error = new Error("Hubo un error");
        return res.status(400).json({msg: error.message});
    }

    try {
        veterinario.token = null
        veterinario.password = password
        await veterinario.save();
        res.json({msg: "Password modificado correctamente"});
    } catch (error) {
        console.log(error);
    }
}

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);
    if(!veterinario) {
        const error = new Error("Hubo un error")
        return res.status(400).json({msg: error.message});
    }

    const { email } = req.body;
    if(veterinario.email !== req.body.email) {
        const existeEmail = await Veterinario.findOne({email});
        if(existeEmail) {
            const error = new Error("El email proporcionado ya está en uso")
            return res.status(400).json({msg: error.message});
        }
    }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;

        const veterinarioActualizado = await veterinario.save();
        res.json(veterinarioActualizado);
    } catch (error) {
        console.log(error)
    }
}

const actualizarPassword = async (req, res) => {
    // Leer los datos
    const { id } = req.veterinario;
    const { pwd_actual, pwd_nuevo } = req.body;

    // Comprobar que el veterinario exista
    const veterinario = await Veterinario.findById(id);
    if(!veterinario) {
        const error = new Error("Hubo un error")
        return res.status(400).json({msg: error.message});
    }

    // Comprobar su password
    if(await veterinario.comprobarPassword(pwd_actual)) {
        // Almacenar el nuevo password
        veterinario.password = pwd_nuevo
        await veterinario.save();
        res.json({msg: "Password actualizado con éxito"})
    } else {
        const error = new Error("El password actual es incorrecto")
        return res.status(400).json({msg: error.message});
    }
}

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    recuperarPassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}