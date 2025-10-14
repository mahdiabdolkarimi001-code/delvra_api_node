const { getDB } = require("../config/db");

exports.createCode = async (email, code) => {
  const db = getDB();
  await db.query(
    "INSERT INTO email_verifications (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
    [email, code]
  );
};

exports.findValidCode = async (email, code) => {
  const db = getDB();
  const [rows] = await db.query(
    "SELECT * FROM email_verifications WHERE email = ? AND code = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
    [email, code]
  );
  return rows[0];
};

exports.deleteCodes = async (email) => {
  const db = getDB();
  await db.query("DELETE FROM email_verifications WHERE email = ?", [email]);
};
