const crypto = require("crypto");

// ต่างจาก bcrypt (เข้ารหัสทางเดียว ถอดกลับไม่ได้) ตัวนี้คือ "เข้ารหัสแบบถอดกลับได้"
// ใช้ตอนอยากให้ Super Admin กดดูรหัสผ่านจริงของแอดมินคนอื่นได้ในเมนูผู้ดูแลระบบ
// sha256 บีบสตริงกุญแจจาก .env ให้ได้ขนาด 32 byte พอดีตามที่ AES-256 ต้องการ
const KEY = crypto
  .createHash("sha256")
  .update(String(process.env.PASSWORD_ENCRYPTION_KEY || ""))
  .digest();
const ALGORITHM = "aes-256-cbc";

// เข้ารหัสรหัสผ่านก่อนเก็บลง DB
// สุ่ม IV ใหม่ทุกครั้งที่เข้ารหัส กันไม่ให้รหัสผ่านเดียวกันออกมาเป็นค่าเดิมซ้ำๆ (เดา pattern ไม่ได้)
// เก็บผลลัพธ์เป็น "iv:ciphertext" ไว้ในช่องเดียว ตอนถอดรหัสค่อยแยก iv ออกมาใช้อีกที
function encryptPassword(plainText) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// ถอดรหัสกลับเป็นรหัสผ่านตัวจริง ใช้ตอน Super Admin กดปุ่ม "ดูรหัสผ่าน" เท่านั้น
function decryptPassword(storedValue) {
  const [ivHex, encryptedHex] = String(storedValue).split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = { encryptPassword, decryptPassword };
