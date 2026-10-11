const db = require('../config/database');

async function runMigration() {
  try {
    console.log('[Migration] Starting database migration...');

    // 1. Create messages table for staff messaging / chat
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_msg_pair (sender_id, receiver_id),
        INDEX idx_msg_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[Migration] Messages table created / verified.');

    // 2. Add duty_status to doctors table
    const [cols] = await db.pool.query("SHOW COLUMNS FROM doctors LIKE 'duty_status'");
    if (cols.length === 0) {
      await db.pool.query("ALTER TABLE doctors ADD COLUMN duty_status ENUM('available', 'attending', 'off_duty') DEFAULT 'available'");
      console.log('[Migration] Added duty_status column to doctors table.');
    } else {
      console.log('[Migration] duty_status column already exists.');
    }

    console.log('[Migration] All migrations completed successfully.');
  } catch (err) {
    console.error('[Migration Error]:', err);
  } finally {
    process.exit(0);
  }
}

runMigration();
