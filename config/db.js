const mysql = require("mysql2/promise");
require("dotenv").config();

let pool;

// تابع اصلی اتصال به دیتابیس
async function connectDB() {
  try {
    // ساخت Pool با تنظیمات پایدار
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
      // زمان‌های طولانی‌تر برای اطمینان از پایداری
      connectTimeout: 20000, // 20 ثانیه
      idleTimeout: 0,        // نذار idle timeout داشته باشه
    });

    console.log("⏳ Testing MySQL connection...");
    const [rows] = await pool.query("SELECT 1");
    console.log("✅ MySQL connection pool established");

    // ساخت جداول در صورت نیاز
    await initTables();

    // هر 5 دقیقه یک ping برای زنده نگه داشتن اتصال
    setInterval(async () => {
      try {
        await pool.query("SELECT 1");
        // console.log("🟢 MySQL keep-alive ping");
      } catch (err) {
        console.error("⚠️ MySQL ping failed, reconnecting...", err.message);
        await reconnectDB();
      }
    }, 5 * 60 * 1000);

  } catch (err) {
    console.error("❌ MySQL connection error:", err);
    setTimeout(connectDB, 5000); // بعد از ۵ ثانیه تلاش مجدد
  }
}

// تابع بازیابی اتصال در صورت قطع شدن
async function reconnectDB() {
  try {
    if (pool) {
      await pool.end().catch(() => {});
    }
    console.log("♻️ Reconnecting to MySQL...");
    await connectDB();
  } catch (err) {
    console.error("❌ Reconnect failed, retrying in 5s...", err);
    setTimeout(reconnectDB, 5000);
  }
}

// تابع ساخت جداول
async function initTables() {
  try {
    const conn = await pool.getConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        userId VARCHAR(50) DEFAULT NULL,
        name VARCHAR(100) DEFAULT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        profile_image1 VARCHAR(255) DEFAULT NULL,
        profile_image2 VARCHAR(255) DEFAULT NULL,
        profile_image3 VARCHAR(255) DEFAULT NULL,
        profile_image4 VARCHAR(255) DEFAULT NULL,
        profile_image5 VARCHAR(255) DEFAULT NULL,
        age INT DEFAULT NULL,
        city VARCHAR(100) DEFAULT NULL,
        gender ENUM('مرد','زن') DEFAULT NULL,
        occupation VARCHAR(100) DEFAULT NULL,
        education VARCHAR(100) DEFAULT NULL,
        height DOUBLE DEFAULT NULL,
        weight DOUBLE DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        friends_count INT DEFAULT 0,
        likes_count INT DEFAULT 0,
        messages_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_user_stats FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        admin_response TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP NULL,
        PRIMARY KEY (id),
        CONSTRAINT fk_tickets_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        plan VARCHAR(50) NOT NULL,
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_date DATETIME DEFAULT NULL,
        status ENUM('active','inactive') DEFAULT 'inactive',
        PRIMARY KEY (id),
        CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        sender_user_id INT UNSIGNED NOT NULL,
        receiver_user_id INT UNSIGNED NOT NULL,
        content TEXT DEFAULT NULL,
        type ENUM('text','image','video','voice') DEFAULT 'text',
        file_url VARCHAR(255) DEFAULT NULL,
        reply_to INT UNSIGNED DEFAULT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_sender_user FOREIGN KEY (sender_user_id)
          REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_receiver_user FOREIGN KEY (receiver_user_id)
          REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_reply_message FOREIGN KEY (reply_to)
          REFERENCES messages(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        sender_id INT UNSIGNED NOT NULL,
        receiver_id INT UNSIGNED NOT NULL,
        status ENUM('pending','accepted','rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_sender FOREIGN KEY (sender_id)
          REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_receiver FOREIGN KEY (receiver_id)
          REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        friend_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_friendship (user_id, friend_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user1_id INT UNSIGNED NOT NULL,
        user2_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_conversation (user1_id, user2_id),
        FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    conn.release();
    console.log("✅ All tables verified");

  } catch (err) {
    console.error("❌ Error while creating tables:", err);
  }
}

// برای گرفتن pool از بخش‌های دیگر
function getDB() {
  if (!pool) throw new Error("❌ DB not connected. Call connectDB() first.");
  return pool;
}

module.exports = { connectDB, getDB };
