const { getDB } = require("../config/db");

class User {
  // پیدا کردن کاربر با id
  static async findById(id) {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  }

  // پیدا کردن کاربر با ایمیل
  static async findByEmail(email) {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  }

  // پیدا کردن کاربر با userId
  static async findByUserId(userId) {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM users WHERE userId = ?", [userId]);
    return rows[0] || null;
  }

  // گرفتن همه کاربران
  static async findAll() {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM users");
    return rows;
  }

  // جستجو و فیلتر کاربران
  static async search({ q, age, gender, city }) {
    const db = getDB();
    let sql = "SELECT * FROM users WHERE 1=1";
    const params = [];

    if (q) {
      sql += " AND (name LIKE ? OR email LIKE ? OR userId LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (age) {
      sql += " AND age = ?";
      params.push(age);
    }
    if (gender && gender !== "همه") {
      sql += " AND gender = ?";
      params.push(gender);
    }
    if (city) {
      sql += " AND city = ?";
      params.push(city);
    }

    const [rows] = await db.query(sql, params);
    return rows;
  }

  // ایجاد کاربر جدید با ایمیل و پسورد
  static async create({ email, password, name, profile_image, age, city, gender, userId }) {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (email, password, name, profile_image, age, city, gender, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, name || null, profile_image || null, age || null, city || null, gender || null, userId || null]
    );

    return await this.findById(result.insertId);
  }

  // آپدیت جزئی کاربر بر اساس id
  static async updateProfile(id, { userId, age, city, gender }) {
    const db = getDB();
    const existingUser = await this.findById(id);
    if (!existingUser) throw new Error(`User not found with id: ${id}`);

    await db.query(
      `UPDATE users
       SET userId = ?, age = ?, city = ?, gender = ?
       WHERE id = ?`,
      [
        userId || existingUser.userId,
        age ?? existingUser.age,
        city || existingUser.city,
        gender || existingUser.gender,
        id
      ]
    );

    return await this.findById(id);
  }
}

module.exports = User;
