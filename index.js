const http = require('http');

let latestCommand = "";

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 1. Enviar un nuevo comando a la nube
    if (req.url === '/api/set-command' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                latestCommand = data.command || "";
                console.log(`[COMANDO NUBE] ${latestCommand}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "success", command: latestCommand }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "error", message: "JSON inválido" }));
            }
        });
    }
    // 2. Borrar / Limpiar el comando actual
    else if (req.url === '/api/clear-command' && req.method === 'POST') {
        latestCommand = "";
        console.log("[COMANDO LIMPIADO EN NUBE]");
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "success", message: "Comando borrado" }));
    }
    // 3. Consultar comando activo (para los scripts de Roblox)
    else if (req.url === '/api/get-command' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ command: latestCommand }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Ruta no encontrada");
    }
});

const PORT = process.env.PORT || 25880;
server.listen(PORT, () => {
    console.log(`Servidor de control activo en el puerto ${PORT}`);
});
