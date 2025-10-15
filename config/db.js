const mysql = require("mysql2/promise");
require("dotenv").config();

let connection = null;

async function connectDB() {
  try {
    // اتصال اولیه بدون دیتابیس
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
    });

    // ساخت دیتابیس اگر وجود نداشت
    await tempConnection.query(`
      CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
    `);
    console.log(`✅ Database '${process.env.DB_NAME}' is ready`);

    // اتصال اصلی به دیتابیس
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
    });
    console.log("✅ MySQL connected");

    // --- جدول users ---
    await connection.query(`
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
    console.log("✅ Table 'users' is ready");

    // --- جدول email_verifications ---
    await connection.query(`
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
    console.log("✅ Table 'email_verifications' is ready");

    // --- جدول user_stats ---
    await connection.query(`
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
    console.log("✅ Table 'user_stats' is ready");

    // --- جدول tickets ---
    await connection.query(`
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
    console.log("✅ Table 'tickets' is ready");

    // --- جدول subscriptions ---
    await connection.query(`
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
    console.log("✅ Table 'subscriptions' is ready");

    // --- جدول messages ---
    await connection.query(`
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
    console.log("✅ Table 'messages' is ready");

    // --- جدول friend_requests ---
    await connection.query(`
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
    console.log("✅ Table 'friend_requests' is ready");

    // --- جدول friends ---
    await connection.query(`
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
    console.log("✅ Table 'friends' is ready");

    // --- جدول conversations ---
    await connection.query(`
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
    console.log("✅ Table 'conversations' is ready");

  } catch (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1);
  }
}

function getDB() {
  if (!connection)
    throw new Error("❌ DB not connected. Call connectDB() first.");
  return connection;
}

module.exports = { connectDB, getDB };
