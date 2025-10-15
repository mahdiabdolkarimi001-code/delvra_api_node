const { getDB } = require("../config/db");

async function fetchUsers() {
  const db = getDB();
  const [rows] = await db.query("SELECT id, name, email, city, gender FROM users ORDER BY id DESC");
  return rows;
}

async function deleteUserById(id) {
  const db = getDB();
  const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
  return result;
}

module.exports = { fetchUsers, deleteUserById };
