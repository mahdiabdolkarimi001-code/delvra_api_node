const { getDB } = require("../config/db");

class Dashboard {
  /**
   * دریافت اطلاعات پایه کاربر
   * شامل: userId, name, age, city, profile_image (اولین تصویر موجود)
   * کاربر با id یا email شناسایی می‌شود
   * @param {number} id
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  static async getUserProfile(id, email) {
    try {
      const db = getDB();

      let query = `
        SELECT 
          userId, 
          name, 
          age, 
          city, 
          profile_image1, 
          profile_image2, 
          profile_image3, 
          profile_image4, 
          profile_image5
        FROM users
        WHERE 1=1
      `;
      const params = [];

      if (id) {
        query += " AND id = ?";
        params.push(id);
      } else if (email) {
        query += " AND email = ?";
        params.push(email);
      } else {
        return null;
      }

      const [rows] = await db.execute(query, params);
      if (rows.length === 0) return null;

      const user = rows[0];

      // انتخاب اولین تصویر موجود
      const profileImage =
        user.profile_image1 ||
        user.profile_image2 ||
        user.profile_image3 ||
        user.profile_image4 ||
        user.profile_image5 ||
        null;

      return {
        userId: user.userId,
        name: user.name,
        age: user.age,
        city: user.city,
        profile_image: profileImage,
      };
    } catch (err) {
      console.error("❌ getUserProfile error:", err);
      throw err;
    }
  }

  /**
   * دریافت آمار کاربر از جدول user_stats
   * @param {number} userId
   * @returns {Promise<object>}
   */
  static async getUserStats(userId) {
    try {
      const db = getDB();
      const [rows] = await db.execute(
        "SELECT friends_count, likes_count, messages_count FROM user_stats WHERE user_id = ?",
        [userId]
      );
      if (rows.length === 0) {
        return {
          friends_count: 0,
          likes_count: 0,
          messages_count: 0,
        };
      }
      return rows[0];
    } catch (err) {
      console.error("❌ getUserStats error:", err);
      return {
        friends_count: 0,
        likes_count: 0,
        messages_count: 0,
      };
    }
  }

  /**
   * داده کامل داشبورد
   * @param {number} id
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  static async getDashboardData(id, email) {
    try {
      const profile = await this.getUserProfile(id, email);
      if (!profile) return null;

      const stats = await this.getUserStats(id);

      return {
        profile,
        stats,
      };
    } catch (err) {
      console.error("❌ getDashboardData error:", err);
      throw err;
    }
  }
}

module.exports = Dashboard;
