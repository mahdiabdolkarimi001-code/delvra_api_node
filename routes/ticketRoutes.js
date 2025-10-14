const express = require("express");
const router = express.Router();
const {
  sendTicket,
  getTickets,
  respondTicket,
  getTicket,
  showTicketsPage,
  respondTicketPage,
} = require("../controllers/ticketController");
const { checkAdminAuth } = require("../middleware/adminMiddleware");

// 📌 API موبایل
router.post("/send", sendTicket);                 // کاربر تیکت می‌فرسته
router.get("/admin", checkAdminAuth, getTickets); // گرفتن همه تیکت‌ها برای ادمین (JSON)
router.post("/admin/respond", checkAdminAuth, respondTicket); // پاسخ ادمین (JSON)
router.get("/:ticketId", getTicket);              // کاربر پیام خودش و پاسخ را می‌بیند

// 📌 صفحات وب ادمین
router.get("/", checkAdminAuth, showTicketsPage);    // صفحه HTML لیست تیکت‌ها
router.post("/respond", checkAdminAuth, respondTicketPage); // فرم پاسخ ادمین

module.exports = router;
