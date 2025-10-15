const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const http = require("http");
const WebSocket = require("ws");
require("dotenv").config();

// اتصال به دیتابیس
const { connectDB } = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const statsRoutes = require("./routes/statsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const searchUserRoutes = require("./routes/searchUserRoutes");
const friendRequestRoutes = require("./routes/friendRequestRoutes");
const editProfileRoutes = require("./routes/editProfileController");
const chatRoutes = require("./routes/chatRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const homeRoutes = require("./routes/homeRoutes"); // اضافه شد

// Middleware
const errorHandler = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware عمومی
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session برای پنل ادمین
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mySecretKey",
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ سرو کردن فایل‌های آپلود شده روی دیسک Liara
// مسیر دیسک: /uploads
app.use("/uploads", express.static("/uploads"));

console.log("🧩 ENV TEST:", process.env.DB_HOST, process.env.DB_NAME);

(async () => {
  try {
    await connectDB();
    console.log("✅ Database connected");

    // Mount کردن routeها
    app.use("/auth", authRoutes);
    app.use("/profile", profileRoutes);
    app.use("/dashboard", dashboardRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/stats", statsRoutes);
    app.use("/", adminRoutes);
    app.use("/api/tickets", ticketRoutes);
    app.use("/tickets", ticketRoutes);
    app.use("/api/users", searchUserRoutes);
    app.use("/api/users", friendRequestRoutes);
    app.use("/editProfile", editProfileRoutes);
    app.use("/", chatRoutes);
    app.use("/api/userprofile", userProfileRoutes);
    app.use("/", adminUserRoutes);
    app.use("/", homeRoutes); // اضافه شد

    // Middleware هندل خطاها
    app.use(errorHandler);

    // ساخت HTTP server برای WebSocket
    const server = http.createServer(app);

    // WebSocket server
    const wss = new WebSocket.Server({ noServer: true });

    const onlineUsers = new Map();
    app.locals.onlineUsers = onlineUsers;

    server.on("upgrade", (request, socket, head) => {
      const { url } = request;
      if (!url) {
        socket.destroy();
        return;
      }

      if (url.startsWith("/ws/chat/")) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    wss.on("connection", (ws, request) => {
      const url = request.url || "";
      const parts = url.split("/");
      const userId = parts.length > 0 ? parts[parts.length - 1] : null;

      if (!userId) {
        ws.close(1008, "Missing userId in path");
        return;
      }

      ws.userId = userId;
      ws.connectedAt = new Date();
      onlineUsers.set(userId, ws);

      console.log(`🟢 WS connected: userId=${userId} (clients=${onlineUsers.size})`);

      ws.send(JSON.stringify({ type: "ws_connected", userId }));

      ws.on("message", (raw) => {
        try {
          const data = JSON.parse(raw);
          if (data.type === "ping") {
            ws.send(JSON.stringify({ type: "pong", time: new Date().toISOString() }));
          }
        } catch (e) {
          console.error("WS message parse error:", e);
        }
      });

      ws.on("close", () => {
        if (ws.userId) {
          onlineUsers.delete(ws.userId);
          console.log(`🔴 WS disconnected: userId=${ws.userId} (clients=${onlineUsers.size})`);
        }
      });

      ws.on("error", (err) => {
        console.error("WS error for user", userId, err);
      });
    });

    app.locals.sendToUser = (userId, payload) => {
      try {
        const ws = onlineUsers.get(String(userId));
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(payload));
        }
      } catch (err) {
        console.error("sendToUser error:", err);
      }
    };

    server.listen(PORT, () => {
      console.log(`✅ Server + WebSocket running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
})();
