const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  // Tabla de usuarios
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    full_name TEXT,
    email TEXT,
    balance REAL,
    role TEXT
  )`);

  // Tabla de transacciones
  db.run(`CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER,
    destination_account TEXT,
    amount REAL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Datos iniciales de prueba (Contraseñas en texto plano para auditoría SAST)
  db.run(`INSERT INTO users (username, password, full_name, email, balance, role) VALUES 
    ('carlos_sv', 'Password123!', 'Carlos Mendoza', 'carlos.mendoza@fintech.sv', 1250.50, 'USER'),
    ('maria_perez', 'Maria2026$', 'María Pérez', 'maria.perez@fintech.sv', 3400.00, 'USER'),
    ('admin_fintech', 'Admin#2026!Sec', 'Administrador Sistema', 'admin@fintech.sv', 99999.99, 'ADMIN')`);

  db.run(`INSERT INTO transactions (account_id, destination_account, amount, description) VALUES 
    (1, 'SV-778899', 150.00, 'Pago de servicios de luz y agua'),
    (1, 'SV-112233', 45.00, 'Transferencia P2P a María'),
    (2, 'SV-445566', 500.00, 'Abono a préstamo personal')`);
});

module.exports = db;
