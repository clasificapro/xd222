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

let activeClients = {};

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

app.get('/api/get-command', (req, res) => {
    res.json(currentCommand);
});

app.post('/api/clear-command', (req, res) => {
    currentCommand = { command: "", sender: "", role: "", jobId: "", timestamp: Date.now() };
    console.log("[COMANDO] Limpiado de la nube.");
    res.json({ success: true });
});

app.post('/api/heartbeat', (req, res) => {
    const { player, jobId } = req.body;
    if (player) {
        activeClients[player] = {
            jobId: jobId || "",
            lastSeen: Date.now()
        };
    }
    res.json({ success: true });
});

app.get('/api/active-clients', (req, res) => {
    const now = Date.now();
    
    for (let p in activeClients) {
        if (now - activeClients[p].lastSeen > 6000) {
            delete activeClients[p];
        }
    }
    
    res.json(activeClients);
});

const PORT = process.env.PORT || 25880;
app.listen(PORT, () => {
    console.log(`Servidor Troller Cloud corriendo en el puerto ${PORT}`);
});
