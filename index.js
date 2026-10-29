const express = require('express');
const app = express();
app.use(express.json());

let currentCommand = {
    command: "",
    sender: "",
    role: "",
    jobId: "",
    timestamp: 0
};

// Almacén de clientes activos
let activeClients = {};

// Endpoint para enviar comandos desde el Panel
app.post('/api/set-command', (req, res) => {
    const { command, sender, role, jobId } = req.body;
    
    currentCommand = {
        command: command || "",
        sender: sender || "Desconocido",
        role: role || "Admin",
        jobId: jobId || "",
        timestamp: Date.now()
    };

    console.log(`[COMANDO] [${role}] ${sender} envió: ${command} (Job: ${jobId})`);
    res.json({ success: true, current: currentCommand });
});

// Endpoint para que los clientes consulten el comando actual
app.get('/api/get-command', (req, res) => {
    res.json(currentCommand);
});

// Endpoint para limpiar comandos
app.post('/api/clear-command', (req, res) => {
    currentCommand = { command: "", sender: "", role: "", jobId: "", timestamp: Date.now() };
    console.log("[COMANDO] Limpiado de la nube.");
    res.json({ success: true });
});

// Endpoint para registrar el latido (Heartbeat) del cliente
app.post('/api/heartbeat', (req, res) => {
    const { player, jobId } = req.body;
    if (player) {
        activeClients[player] = {
            jobId: jobId || "",
            lastSeen: Date.now()
        };
        console.log(`[LATIDO] Registrado: ${player} (Job: ${jobId})`);
    }
    res.json({ success: true });
});

// Endpoint para que el Panel consulte los clientes activos
app.get('/api/active-clients', (req, res) => {
    const now = Date.now();
    
    // Si pasan más de 8 segundos sin latido, se borra automáticamente
    for (let p in activeClients) {
        if (now - activeClients[p].lastSeen > 8000) {
            console.log(`[INACTIVO] Eliminado por inactividad: ${p}`);
            delete activeClients[p];
        }
    }
    
    res.json(activeClients);
});

const PORT = process.env.PORT || 25880;
app.listen(PORT, () => {
    console.log(`Servidor Troller Cloud corriendo en el puerto ${PORT}`);
});
