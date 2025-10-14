// models/friendRequestModel.js
const { getDB } = require("../config/db");
const Chat = require("./chatModel"); // فرض بر این است که chatModel.createConversation دارد

class FriendRequest {
  // 📥 گرفتن همه درخواست‌های دریافتی همراه با اطلاعات کاربر
  static async getReceivedRequests(userId) {
    const db = getDB();
    const [rows] = await db.query(
      `SELECT fr.*, 
              u.name AS sender_name, 
              u.age AS sender_age, 
              u.city AS sender_city, 
              u.profile_image1 AS sender_avatar
       FROM friend_requests fr
       JOIN users u ON fr.sender_id = u.id
       WHERE fr.receiver_id = ? AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // ✅ قبول کردن درخواست و ایجاد دوستی و رکورد چت
  static async acceptRequest(requestId) {
    const db = getDB();

    const [requests] = await db.query(
      "SELECT * FROM friend_requests WHERE id = ? AND status = 'pending'",
      [requestId]
    );

    if (requests.length === 0) return false;

    const { sender_id, receiver_id } = requests[0];

    // تغییر وضعیت درخواست به accepted
    await db.query(
      "UPDATE friend_requests SET status = 'accepted' WHERE id = ?",
      [requestId]
    );

    // ذخیره در جدول friends (دوطرفه)
    await db.query(
      "INSERT IGNORE INTO friends (user_id, friend_id) VALUES (?, ?), (?, ?)",
      [sender_id, receiver_id, receiver_id, sender_id]
    );

    // آپدیت تعداد دوستان در user_stats
    await db.query(
      `UPDATE user_stats 
       SET friends_count = (SELECT COUNT(*) FROM friends WHERE user_id = ?) 
       WHERE user_id = ?`,
      [sender_id, sender_id]
    );
    await db.query(
      `UPDATE user_stats 
       SET friends_count = (SELECT COUNT(*) FROM friends WHERE user_id = ?) 
       WHERE user_id = ?`,
      [receiver_id, receiver_id]
    );

    // ایجاد رکورد چت (conversation)
    await Chat.createConversation(sender_id, receiver_id);

    return true;
  }

  // ❌ رد کردن درخواست
  static async rejectRequest(requestId) {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE friend_requests SET status = 'rejected' WHERE id = ?",
      [requestId]
    );
    return result.affectedRows > 0;
  }

  // 📋 گرفتن لیست دوستان یک کاربر
  static async getFriendsList(userId) {
    const db = getDB();
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.profile_image1 AS avatar
       FROM friends f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = ?`,
      [userId]
    );
    return rows;
  }
}

module.exports = FriendRequest;
