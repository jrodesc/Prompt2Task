const pool = require('../db/connection');

async function toggle(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM subtasks WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Subtarea no encontrada' });

    const [taskRows] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND userId = ?',
      [rows[0].taskId, req.user.id]
    );
    if (taskRows.length === 0) return res.status(403).json({ message: 'No autorizado' });

    await pool.query('UPDATE subtasks SET completed = NOT completed WHERE id = ?', [id]);
    const [updated] = await pool.query('SELECT * FROM subtasks WHERE id = ?', [id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = { toggle };
