// داده‌های ادمین‌ها (فعلاً ثابت)
const ADMINS = [
  { email: "vyhan@gmail.com", password: "123456" },
  { email: "kiana@gmail.com", password: "654321" },
];

function findAdmin(email, password) {
  return ADMINS.find((a) => a.email === email && a.password === password);
}

module.exports = { findAdmin };
