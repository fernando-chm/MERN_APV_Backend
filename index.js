import express from "express";
import conectarDB from "./config/db.js";
import dotenv from "dotenv";
import veterinarioRoutes from './routes/veterinarioRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import cors from 'cors';

const app = express(); // Inicializar app
app.use(express.json()); // Para poder usar json() en Express

dotenv.config(); // Para leer las variables de entorno de .env
conectarDB(); // Conectar la DB

const dominiosPermitidos = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: function(origin, callback) {
        if(dominiosPermitidos.indexOf(origin) !== -1) {
            // El origen (el dominio) del request está permitido
            callback(null, true);
        } else {
            callback(new Error("No se permite el acceso por CORS"));
        }
    }
}
app.use(cors(corsOptions));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});

app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/pacientes', pacienteRoutes);