const { getDB } = require("../config/db");
const path = require("path");

// ---------------- مدل‌ها ----------------
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

// ---------------- کنترلرها ----------------

// کاربر تیکت می‌فرسته
async function sendTicket(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    const id = await createTicket(name, email, subject, message);
    res.json({ success: true, ticketId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطا در ارسال پیام" });
  }
}

// ادمین همه تیکت‌ها (API JSON)
async function getTickets(req, res) {
  try {
    const tickets = await getAllTickets();
    res.json({ success: true, tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ادمین پاسخ می‌دهد (API JSON)
async function respondTicket(req, res) {
  try {
    const { ticketId, response } = req.body;
    await replyTicket(ticketId, response);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// کاربر پیام و پاسخ را می‌بیند
async function getTicket(req, res) {
  try {
    const { ticketId } = req.params;
    const ticket = await getTicketById(ticketId);
    res.json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ---------------- صفحات وب ادمین ----------------

// نمایش صفحه HTML tickets.html
function showTicketsPage(req, res) {
  res.sendFile(path.join(__dirname, "../views/tickets.html"));
}

// پاسخ دادن از طریق فرم HTML و بازگشت به صفحه
async function respondTicketPage(req, res) {
  try {
    const { ticketId, response } = req.body;
    await replyTicket(ticketId, response);
    res.redirect("/tickets"); // بعد از پاسخ دوباره لیست نمایش داده شود
  } catch (err) {
    console.error(err);
    res.status(500).send("خطا در پاسخ به تیکت");
  }
}

module.exports = {
  createTicket,
  getAllTickets,
  replyTicket,
  getTicketById,
  sendTicket,
  getTickets,
  respondTicket,
  getTicket,
  showTicketsPage,
  respondTicketPage,
};
