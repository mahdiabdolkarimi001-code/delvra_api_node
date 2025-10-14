const bcrypt = require("bcryptjs");
const { getDB } = require("../config/db");

class User {
  constructor({
    id,
    name,
    email,
    password,
    is_verified,
    profile_image1,
    profile_image2,
    profile_image3,
    profile_image4,
    profile_image5,
  }) {
    this.id = id;
    this.name = name || null;
    this.email = email;
    this.password = password;
    this.is_verified = is_verified || false;
    this.profile_image1 = profile_image1 || null;
    this.profile_image2 = profile_image2 || null;
    this.profile_image3 = profile_image3 || null;
    this.profile_image4 = profile_image4 || null;
    this.profile_image5 = profile_image5 || null;
  }

  // 🔍 پیدا کردن کاربر با ایمیل
  static async findByEmail(email) {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows[0]) return null;
    return new User(rows[0]);
  }

  // 🔍 پیدا کردن کاربر با ID
  static async findById(id) {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    if (!rows[0]) return null;
    return new User(rows[0]);
  }

  // 🧩 ایجاد کاربر جدید (ثبت‌نام)
  static async createUser({ email, password }) {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (email, password, is_verified) VALUES (?, ?, ?)",
      [email, hashedPassword, false]
    );

    return new User({
      id: result.insertId,
      email,
      password: hashedPassword,
      is_verified: false,
    });
  }

  // 🧠 به‌روزرسانی نام و عکس پروفایل
  static async updateProfile(id, name, profileImage) {
    const db = getDB();

    if (profileImage) {
      const user = await User.findById(id);
      let field = null;

      for (let i = 1; i <= 5; i++) {
        if (!user[`profile_image${i}`]) {
          field = `profile_image${i}`;
          break;
        }
      }

      if (field) {
        await db.query(`UPDATE users SET name = ?, ${field} = ? WHERE id = ?`, [
          name,
          profileImage,
          id,
        ]);
      } else {
        await db.query(`UPDATE users SET name = ?, profile_image1 = ? WHERE id = ?`, [
          name,
          profileImage,
          id,
        ]);
      }
    } else {
      await db.query("UPDATE users SET name = ? WHERE id = ?", [name, id]);
    }

    return await User.findById(id);
  }

  // ✅ مقایسه رمز عبور
  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  // ✅ تأیید کاربر بعد از وارد کردن کد
  static async verifyUser(email) {
    const db = getDB();
    await db.query("UPDATE users SET is_verified = ? WHERE email = ?", [true, email]);
  }

  // ⚠️ بازگرداندن کاربر به حالت در انتظار تأیید
  static async setVerificationPending(email) {
    const db = getDB();
    await db.query("UPDATE users SET is_verified = ? WHERE email = ?", [false, email]);
  }
}

module.exports = User;
