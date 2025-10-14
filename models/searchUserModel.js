const { getDB } = require("../config/db");

class SearchUser {
  constructor({ id, name, age, city, profile_image, gender }) {
    this.id = id;
    this.name = name || null;
    this.age = age || null;
    this.city = city || null;
    this.profile_image = profile_image || null;
    this.gender = gender || null;
  }

  // گرفتن همه کاربران
  static async getAll() {
    const db = getDB();
    try {
      // استفاده از profile_image1 به عنوان تصویر اصلی و alias profile_image
      const [rows] = await db.query(`
        SELECT 
          id, 
          name, 
          age, 
          city, 
          profile_image1 AS profile_image, 
          gender 
        FROM users
      `);
      return rows.map((row) => new SearchUser(row));
    } catch (err) {
      console.error("❌ getAll error:", err);
      throw err;
    }
  }

  // چک کردن وجود درخواست قبلی
  static async requestExists(senderId, receiverId) {
    const db = getDB();
    try {
      const [rows] = await db.query(
        "SELECT * FROM friend_requests WHERE sender_id = ? AND receiver_id = ?",
        [senderId, receiverId]
      );
      return rows.length > 0;
    } catch (err) {
      console.error("❌ requestExists error:", err);
      throw err;
    }
  }

  // ذخیره درخواست دوستی
  static async sendRequest(senderId, receiverId) {
    const db = getDB();
    try {
      const [result] = await db.query(
        "INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)",
        [senderId, receiverId]
      );
      return result.insertId;
    } catch (err) {
      console.error("❌ sendRequest error:", err);
      throw err;
    }
  }
}

module.exports = SearchUser;
