// database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado a la base de datos SQLite en memoria (FinTech SV).');
});

db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, full_name TEXT, balance REAL)');
  db.run('CREATE TABLE transactions (id INTEGER PRIMARY KEY, account_id INTEGER, amount REAL, description TEXT)');
  
  const insertUser = db.prepare('INSERT INTO users (username, password, full_name, balance) VALUES (?, ?, ?, ?)');
  insertUser.run('admin_sv', 'Admin2026!', 'Administrador', 100000.00);
  insertUser.run('cmendoza', 'P@ssw0rdSV', 'Carlos Mendoza', 7500.50);
  insertUser.run('jperez', 'juan123', 'Juan Pérez', 1234.25);
  insertUser.finalize();

  const insertTx = db.prepare('INSERT INTO transactions (account_id, amount, description) VALUES (?, ?, ?)');
  insertTx.run(2, -150.00, 'Pago de energía eléctrica');
  insertTx.run(2, 500.00, 'Abono de salario');
  insertTx.run(3, -20.00, 'Transferencia P2P');
  insertTx.finalize();
});

module.exports = db;
