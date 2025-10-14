const { getDB } = require("../config/db");

async function createTicket(userName, userEmail, subject, message) {
  const db = getDB();
  const [result] = await db.execute(
    "INSERT INTO tickets (user_name, user_email, subject, message) VALUES (?, ?, ?, ?)",
    [userName, userEmail, subject, message]
  );
  return result.insertId;
}

async function getAllTickets() {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM tickets ORDER BY created_at DESC"
  );
  return rows;
}

async function replyTicket(ticketId, adminResponse) {
  const db = getDB();
  await db.execute(
    "UPDATE tickets SET admin_response = ?, responded_at = NOW() WHERE id = ?",
    [adminResponse, ticketId]
  );
}

async function getTicketById(ticketId) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM tickets WHERE id = ?",
    [ticketId]
  );
  return rows[0];
}

module.exports = { createTicket, getAllTickets, replyTicket, getTicketById };
