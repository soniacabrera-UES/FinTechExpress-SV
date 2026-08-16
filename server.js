// server.js
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('./database.js');
const app = express();
const PORT = process.env.PORT || 3000;

// --- VULNERABILIDAD SAST: SECRETO EXPUESTO EN CÓDIGO ---
// Cadena de conexión heredada expuesta, ideal para SonarCloud/Snyk
const OLD_DB_CONNECTION_STRING = "postgres://admin:supersecretpassword123!@db.legacy.vulnerable.bank/prod";
const JWT_SECRET = "CLAVE_SECRETA_FINTECH_EXPRESS_SV_2026";
// --------------------------------------------------------

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración del motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('login', { error: null });
});

// --- VULNERABILIDAD DAST/SAST: INYECCIÓN SQL ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Consulta vulnerable construida concatenando directamente la entrada del usuario
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  db.get(query, [], (err, user) => {
    if (err) return res.status(500).send("Error del servidor");
    
    if (user) {
      // Generación de JWT para la sesión de la API
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.render('dashboard', { 
        username: user.username,
        full_name: user.full_name,
        balance: user.balance.toFixed(2),
        token: token,
        accountId: user.id
      });
    } else {
      res.render('login', { error: 'Usuario o contraseña inválidos.' });
    }
  });
});

// --- VULNERABILIDAD API: IDOR (Broken Object Level Authorization) ---
// No valida si el usuario logueado es el dueño de la cuenta consultada
app.get('/api/transactions', (req, res) => {
  const accountId = req.query.account_id;
  db.all(`SELECT * FROM transactions WHERE account_id = ${accountId}`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error en BD" });
    res.json({ data: rows });
  });
});

app.listen(PORT, () => {
  console.log(`FinTech Express SV ejecutándose en puerto ${PORT}`);
});
