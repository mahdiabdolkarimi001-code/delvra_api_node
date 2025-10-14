const { getDB } = require("../config/db");

class Chat {
  // 🔸 گرفتن لیست چت‌ها برای کاربر همراه با آخرین پیام
  static async getChatList(userId) {
    const db = getDB();

    const [friends] = await db.query(
      `SELECT u.id AS friend_id, u.name, u.profile_image1
       FROM conversations c
       JOIN users u ON (u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id))
       WHERE c.user1_id = ? OR c.user2_id = ?`,
      [userId, userId, userId]
    );

    const chatList = await Promise.all(
      friends.map(async (friend) => {
        const [lastMsgRows] = await db.query(
          `SELECT content, type, file_url, is_read, created_at
           FROM messages
           WHERE (sender_user_id = ? AND receiver_user_id = ?)
              OR (sender_user_id = ? AND receiver_user_id = ?)
           ORDER BY created_at DESC
           LIMIT 1`,
          [userId, friend.friend_id, friend.friend_id, userId]
        );

        const lastMessage = lastMsgRows[0] || null;

        return {
          friendId: friend.friend_id,
          name: friend.name,
          profile_image1: friend.profile_image1,
          lastMessage: lastMessage ? lastMessage.content : null,
          lastMessageType: lastMessage ? lastMessage.type : null,
          lastMessageFile: lastMessage ? lastMessage.file_url : null,
          lastMessageTime: lastMessage ? lastMessage.created_at : null,
          isRead: lastMessage ? lastMessage.is_read : true,
        };
      })
    );

    // مرتب‌سازی بر اساس زمان آخرین پیام (جدیدترین بالا)
    chatList.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    return chatList;
  }

  // 🔸 ایجاد کانورسیشن بین دو کاربر
  static async createConversation(user1_id, user2_id) {
    const db = getDB();
    await db.query(
      "INSERT IGNORE INTO conversations (user1_id, user2_id) VALUES (?, ?)",
      [user1_id, user2_id]
    );
  }

  // 🔸 گرفتن آخرین پیام بین دو کاربر
  static async getLastMessage(userId, friendId) {
    const db = getDB();
    const [rows] = await db.query(
      `SELECT id, sender_user_id, receiver_user_id, content, type, file_url, reply_to, is_read, created_at
       FROM messages
       WHERE (sender_user_id = ? AND receiver_user_id = ?)
          OR (sender_user_id = ? AND receiver_user_id = ?)
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, friendId, friendId, userId]
    );
    return rows[0] || null;
  }

  // 🔸 گرفتن کل پیام‌های بین دو کاربر با اطلاعات sender و receiver
  static async getConversationMessages(userId, friendId) {
    const db = getDB();
    const [rows] = await db.query(
      `SELECT m.id, m.sender_user_id, m.receiver_user_id, m.content, 
              m.type, m.file_url, m.reply_to, m.is_read, m.created_at,
              u1.name AS sender_name, u1.profile_image1 AS sender_profile_image,
              u2.name AS receiver_name, u2.profile_image1 AS receiver_profile_image
       FROM messages m
       JOIN users u1 ON m.sender_user_id = u1.id
       JOIN users u2 ON m.receiver_user_id = u2.id
       WHERE (m.sender_user_id = ? AND m.receiver_user_id = ?)
          OR (m.sender_user_id = ? AND m.receiver_user_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, friendId, friendId, userId]
    );

    return rows.map((msg) => ({
      ...msg,
      senderProfileUrl: msg.sender_profile_image,
      receiverProfileUrl: msg.receiver_profile_image,
    }));
  }

  // 🔸 ارسال پیام جدید (متنی، عکس، ویس، فایل)
  static async sendMessage(
    senderId,
    receiverId,
    content = null,
    type = "text",
    fileUrl = null,
    replyTo = null
  ) {
    const db = getDB();
    const [result] = await db.query(
      `INSERT INTO messages (sender_user_id, receiver_user_id, content, type, file_url, reply_to, is_read)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [senderId, receiverId, content, type, fileUrl, replyTo]
    );

    const [rows] = await db.query(`SELECT * FROM messages WHERE id = ?`, [
      result.insertId,
    ]);
    return rows[0];
  }

  // 🔸 علامت‌گذاری همه پیام‌های یک فرستنده به عنوان خوانده‌شده
  static async markMessagesAsRead(userId, friendId) {
    const db = getDB();
    await db.query(
      `UPDATE messages 
       SET is_read = TRUE 
       WHERE receiver_user_id = ? AND sender_user_id = ?`,
      [userId, friendId]
    );
  }

  // 🔸 علامت‌گذاری یک پیام خاص به عنوان خوانده‌شده
  static async markMessageAsRead(messageId) {
    const db = getDB();
    const [result] = await db.query(
      `UPDATE messages SET is_read = TRUE WHERE id = ?`,
      [messageId]
    );
    return result.affectedRows > 0;
  }

  // 🔸 حذف کامل کانورسیشن و پیام‌های بین دو کاربر (برای هر دو طرف)
  static async deleteConversation(user1_id, user2_id) {
    const db = getDB();

    // بررسی صحت IDها
    user1_id = parseInt(user1_id);
    user2_id = parseInt(user2_id);
    if (isNaN(user1_id) || isNaN(user2_id)) {
      throw new Error("Invalid user ids for deleteConversation");
    }

    await db.beginTransaction();
    try {
      // حذف همه پیام‌های بین دو کاربر (در هر جهت)
      await db.query(
        `DELETE FROM messages
         WHERE (sender_user_id = ? AND receiver_user_id = ?)
            OR (sender_user_id = ? AND receiver_user_id = ?)`,
        [user1_id, user2_id, user2_id, user1_id]
      );

      // حذف رکورد کانورسیشن در هر ترتیبی که ذخیره شده باشد
      await db.query(
        `DELETE FROM conversations
         WHERE (user1_id = ? AND user2_id = ?)
            OR (user1_id = ? AND user2_id = ?)`,
        [user1_id, user2_id, user2_id, user1_id]
      );

      await db.commit();
      return true;
    } catch (err) {
      await db.rollback();
      throw err;
    }
  }
}

module.exports = Chat;
