const Chat = require("../models/chatModel");
const FriendRequest = require("../models/friendRequestModel");

// 🔹 گرفتن لیست چت‌ها
const getChatList = async (req, res) => {
  try {
    let { userId } = req.params;
    userId = parseInt(userId);
    if (isNaN(userId))
      return res.status(400).json({ success: false, message: "شناسه کاربر نامعتبر است" });

    const friends = await FriendRequest.getFriendsList(userId);

    const chatList = await Promise.all(
      friends.map(async (friend) => {
        const lastMessage = await Chat.getLastMessage(userId, friend.id);
        return {
          friendId: friend.id,
          name: friend.name,
          profile_image1: friend.profile_image1,
          lastMessage: lastMessage ? lastMessage.content : null,
          lastMessageTime: lastMessage ? lastMessage.created_at : null,
          isRead: lastMessage ? lastMessage.is_read : true,
        };
      })
    );

    chatList.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.json({ success: true, chatList });
  } catch (err) {
    console.error("❌ getChatList error:", err);
    res.status(500).json({ success: false, message: "خطا در دریافت لیست چت", error: err.message });
  }
};

// 🔹 دریافت مکالمه بین دو کاربر
const getConversation = async (req, res) => {
  try {
    let { userId, friendId } = req.params;
    userId = parseInt(userId);
    friendId = parseInt(friendId);
    if (isNaN(userId) || isNaN(friendId))
      return res.status(400).json({ success: false, message: "شناسه کاربر نامعتبر است" });

    const messages = await Chat.getConversationMessages(userId, friendId);
    await Chat.markMessagesAsRead(userId, friendId);

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender_user_id,
      receiverId: msg.receiver_user_id,
      content: msg.content,
      type: msg.type,
      fileUrl: msg.file_url,
      replyTo: msg.reply_to,
      isRead: msg.is_read,
      createdAt: msg.created_at,
      senderName: msg.sender_name,
      senderProfileUrl: msg.senderProfileUrl,
      receiverName: msg.receiver_name,
      receiverProfileUrl: msg.receiverProfileUrl,
    }));

    res.json({ success: true, messages: formattedMessages });
  } catch (err) {
    console.error("❌ getConversation error:", err);
    res.status(500).json({ success: false, message: "خطا در دریافت مکالمه", error: err.message });
  }
};

// 🔹 ارسال پیام متنی یا فایل (ویس، تصویر، ویدئو)
const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, type = "text", replyTo = null } = req.body;
    let fileUrl = null;

    if (req.file) fileUrl = `/uploads/${req.file.filename}`;

    if (!senderId || !receiverId)
      return res.status(400).json({ success: false, message: "شناسه ارسال‌کننده یا گیرنده ناقص است" });

    if (type === "text" && (!content || content.trim() === ""))
      return res.status(400).json({ success: false, message: "متن پیام خالی است" });

    const message = await Chat.sendMessage(senderId, receiverId, content, type, fileUrl, replyTo);
    await Chat.createConversation(senderId, receiverId);

    // ارسال پیام جدید از طریق WebSocket (اختیاری)
    if (req.app.locals.sendToUser) {
      req.app.locals.sendToUser(receiverId, { type: "new_message", message });
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error("❌ sendMessage error:", err);
    res.status(500).json({ success: false, message: "خطا در ارسال پیام", error: err.message });
  }
};

// 🔹 علامت‌گذاری پیام به عنوان خوانده شده
const markAsRead = async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    if (isNaN(messageId))
      return res.status(400).json({ success: false, message: "شناسه پیام نامعتبر است" });

    const updated = await Chat.markMessageAsRead(messageId);
    if (!updated) return res.status(404).json({ success: false, message: "پیام پیدا نشد" });

    res.status(200).json({ success: true, message: "پیام علامت‌گذاری شد به عنوان خوانده شده" });
  } catch (err) {
    console.error("❌ markAsRead error:", err);
    res.status(500).json({ success: false, message: "خطا در markAsRead", error: err.message });
  }
};

// 🔹 حذف کامل مکالمه و پیام‌های مرتبط بین دو کاربر
const deleteConversation = async (req, res) => {
  try {
    let { userId, friendId } = req.params;
    userId = parseInt(userId);
    friendId = parseInt(friendId);
    if (isNaN(userId) || isNaN(friendId)) {
      return res.status(400).json({ success: false, message: "شناسه کاربر نامعتبر است" });
    }

    await Chat.deleteConversation(userId, friendId);

    // اطلاع‌رسانی به هر دو کاربر (در صورت آنلاین بودن)
    if (req.app.locals.sendToUser) {
      try {
        req.app.locals.sendToUser(userId, { type: "conversation_deleted", friendId });
        req.app.locals.sendToUser(friendId, { type: "conversation_deleted", friendId: userId });
      } catch (e) {
        console.error("notify delete error:", e);
      }
    }

    res.json({ success: true, message: "کانورسیشن و پیام‌های مرتبط حذف شدند" });
  } catch (err) {
    console.error("❌ deleteConversation error:", err);
    res.status(500).json({ success: false, message: "خطا در حذف کانورسیشن", error: err.message });
  }
};

module.exports = {
  getChatList,
  getConversation,
  sendMessage,
  markAsRead,
  deleteConversation,
};
