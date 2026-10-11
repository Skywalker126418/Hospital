const db = require('../config/database');

/**
 * Get message thread between current user and chosen partner
 */
const getMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { partnerId } = req.params;

    const [rows] = await db.query(
      `SELECT 
        m.id, m.sender_id, m.receiver_id, m.message, m.is_read, m.created_at,
        u_sender.name as sender_name, u_sender.role as sender_role, u_sender.profile_image as sender_image,
        u_recv.name as receiver_name, u_recv.role as receiver_role, u_recv.profile_image as receiver_image
      FROM messages m
      JOIN users u_sender ON m.sender_id = u_sender.id
      JOIN users u_recv ON m.receiver_id = u_recv.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC`,
      [currentUserId, partnerId, partnerId, currentUserId]
    );

    // Mark received messages as read
    await db.query(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [partnerId, currentUserId]
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message to any staff member (Admin, Doctor, Receptionist)
 */
const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, message } = req.body;

    if (!receiver_id || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and message text are required.' });
    }

    const [receiver] = await db.query('SELECT id, name, role FROM users WHERE id = ?', [receiver_id]);
    if (receiver.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    const [result] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [senderId, receiver_id, message.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: {
        id: result.insertId,
        sender_id: senderId,
        receiver_id: parseInt(receiver_id, 10),
        message: message.trim(),
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get contacts list for the chat system with unread badges
 */
const getChatContacts = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    const [rows] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.role, u.profile_image,
        d.specialization, d.department, COALESCE(d.duty_status, 'available') as duty_status,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0
        ) as unread_count,
        (
          SELECT message 
          FROM messages 
          WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id)
          ORDER BY created_at DESC LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM messages 
          WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id)
          ORDER BY created_at DESC LIMIT 1
        ) as last_message_time
      FROM users u
      LEFT JOIN doctors d ON d.user_id = u.id
      WHERE u.id != ? AND u.status = 'active'
      ORDER BY last_message_time DESC, u.name ASC`,
      [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId]
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get total unread messages count for logged-in user
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const [rows] = await db.query(
      'SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = ? AND is_read = 0',
      [currentUserId]
    );
    const count = rows[0]?.unread_count || 0;
    return res.status(200).json({
      success: true,
      count: parseInt(count, 10),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
  getChatContacts,
  getUnreadCount,
};
