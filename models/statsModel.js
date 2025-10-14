// models/userStatsModel.js
const { getDB } = require("../config/db");

class UserStats {
  // 📊 گرفتن آمار کاربر با JOIN روی users
  static async getStats(userId) {
    const db = getDB();

    const [rows] = await db.query(
      `SELECT 
         u.id as userId, u.name, u.profile_image as profileImage, u.age, u.city, u.bio,
         s.friends_count as friends, s.likes_count as likes, s.messages_count as messages
       FROM users u
       LEFT JOIN user_stats s ON u.id = s.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length > 0) {
      // اگر رکورد stats وجود نداشته باشد، مقدار پیش‌فرض می‌دهیم
      return {
        userId: rows[0].userId,
        name: rows[0].name,
        profileImage: rows[0].profileImage,
        age: rows[0].age,
        city: rows[0].city,
        bio: rows[0].bio,
        friends: rows[0].friends ?? 0,
        likes: rows[0].likes ?? 0,
        messages: rows[0].messages ?? 0
      };
    }

    // اگر کاربر وجود نداشت
    return null;
  }

  // ⬆️ درج یا بروزرسانی رکورد stats
  static async upsertStats(userId, friends = 0, likes = 0, messages = 0) {
    const db = getDB();

    // بررسی وجود رکورد
    const [existing] = await db.query(
      `SELECT * FROM user_stats WHERE user_id = ?`,
      [userId]
    );

    if (existing.length > 0) {
      // بروزرسانی
      await db.query(
        `UPDATE user_stats SET friends_count=?, likes_count=?, messages_count=?, updated_at=NOW() WHERE user_id=?`,
        [friends, likes, messages, userId]
      );
    } else {
      // درج
      await db.query(
        `INSERT INTO user_stats (user_id, friends_count, likes_count, messages_count) VALUES (?, ?, ?, ?)`,
        [userId, friends, likes, messages]
      );
    }
  }
}

module.exports = UserStats;
