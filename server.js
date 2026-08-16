const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// HALLAZGO SAST/CRIPTO: Clave secreta hardcodeada en el código fuente
const JWT_SECRET = "CLAVE_SECRETA_FINTECH_EXPRESS_SV_2026_SUPER_INSEGURA";

// Configuración insegura: No se establecen cabeceras de seguridad (Helmet ausente)

app.get('/', (req, res) => {
  res.send(`
    <h1>Bienvenido a FinTech Express El Salvador</h1>
    <p>Portal de Servicios Financieros Digitales.</p>
    <ul>
      <li>API de Búsqueda de Usuarios: <code>/api/v1/users/search?query=</code></li>
      <li>API de Transacciones: <code>/api/v1/account/transactions?account_id=</code></li>
      <li>Portal de Soporte: <code>/support?ticket=</code></li>
    </ul>
  `);
});

// HALLAZGO 1 (SAST / INYECCIÓN SQL): Concatenación directa de entradas de usuario
app.get('/api/v1/users/search', (req, res) => {
  const searchQuery = req.query.query;
  
  // Vulnerable a Inyección SQL: ' OR '1'='1
  const sql = "SELECT id, username, full_name, email, balance FROM users WHERE username LIKE '%" + searchQuery + "%'";
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Error en la consulta de base de datos", details: err.message });
    }
    res.json({ status: "success", data: rows });
  });
});

// HALLAZGO 2 (SAST / BROKEN OBJECT LEVEL AUTHORIZATION - IDOR):
// No se valida si el account_id pertenece al usuario autenticado
app.get('/api/v1/account/transactions', (req, res) => {
  const accountId = req.query.account_id;

  if (!accountId) {
    return res.status(400).json({ error: "Parámetro account_id es requerido." });
  }

  const sql = `SELECT * FROM transactions WHERE account_id = ${accountId}`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener transacciones." });
    }
    res.json({
      status: "success",
      account_id: accountId,
      transactions: rows
    });
  });
});

// Autenticación con emisión de JWT inseguro
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Consulta vulnerable a SQL Injection en Login
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(sql, [], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ status: "success", token: token });
  });
});

// HALLAZGO 3 (DAST / REFLECTED XSS): Renderizado de entrada sin sanitizar
app.get('/support', (req, res) => {
  const ticketId = req.query.ticket || 'General';
  
  // Reflected XSS: Se imprime directamente la variable en el HTML
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Soporte FinTech Express</title></head>
    <body>
      <h2>Centro de Atención al Cliente - El Salvador</h2>
      <p>Consultando el estado del Ticket ID: <strong>${ticketId}</strong></p>
      <form action="/support" method="GET">
        <label>Ingrese número de Ticket:</label>
        <input type="text" name="ticket" />
        <button type="submit">Buscar</button>
      </form>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor FinTech Express SV ejecutándose en el puerto ${PORT}`);
});
