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

// Endpoint para limpiar
app.post('/api/clear-command', (req, res) => {
    currentCommand = { command: "", sender: "", role: "", jobId: "", timestamp: Date.now() };
    console.log("[COMANDO] Limpiado de la nube.");
    res.json({ success: true });
});

const PORT = process.env.PORT || 25880;
app.listen(PORT, () => {
    console.log(`Servidor Troller Cloud corriendo en el puerto ${PORT}`);
});
