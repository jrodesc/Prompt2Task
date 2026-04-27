const pool = require('../db/connection');

async function getAll(req, res) {
  try {
    const userId = req.user.id;
    const { status, priority, category, projectId, search, archived } = req.query;

    // Build query dynamically
    let sql = 'SELECT * FROM tasks WHERE userId = ?';
    const params = [userId];

    // Default: show non-archived tasks
    sql += archived === 'true' ? ' AND archived = 1' : ' AND archived = 0';

    if (status)    { sql += ' AND status = ?';        params.push(status); }
    if (priority)  { sql += ' AND priority = ?';      params.push(priority); }
    if (category)  { sql += ' AND category = ?';      params.push(category); }
    if (projectId) { sql += ' AND projectId = ?';     params.push(projectId); }
    if (search)    { sql += ' AND title LIKE ?';      params.push(`%${search}%`); }

    sql += ' ORDER BY createdAt DESC';

    console.log('Query:', sql);
    const [rows] = await pool.query(sql, params);

    // Get project names separately if needed
    const result = await Promise.all(rows.map(async (task) => {
      if (task.projectId) {
        const [[project]] = await pool.query('SELECT name FROM projects WHERE id = ?', [task.projectId]);
        return { ...task, projectName: project?.name || null };
      }
      return { ...task, projectName: null };
    }));

    console.log(`Fetched ${result.length} tasks for user ${userId}`);
    return res.json(result);
  } catch (err) {
    console.error('Error in getAll:', err);
    return res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
}

async function getOne(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT t.*, p.name AS projectName FROM tasks t LEFT JOIN projects p ON t.projectId = p.id WHERE t.id = ? AND t.userId = ?',
      [id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function create(req, res) {
  const { title, description, status, priority, category, dueDate, projectId } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (userId, projectId, title, description, status, priority, category, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, projectId || null, title, description || null, status || 'todo', priority || 'medium', category || 'other', dueDate || null]
    );
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const fields = req.body;

  const allowed = ['title', 'description', 'status', 'priority', 'category', 'dueDate', 'projectId', 'archived'];
  const updates = Object.keys(fields).filter((k) => allowed.includes(k));
  if (updates.length === 0) return res.status(400).json({ message: 'Sin campos para actualizar' });

  const sql = `UPDATE tasks SET ${updates.map((k) => `${k} = ?`).join(', ')} WHERE id = ? AND userId = ?`;
  const params = [...updates.map((k) => fields[k]), id, req.user.id];

  try {
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ? AND userId = ?', [id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function getMetrics(req, res) {
  const userId = req.user.id;
  try {
    const [[totals]] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'todo') AS todo,
        SUM(status = 'in_progress') AS in_progress,
        SUM(status = 'done') AS done,
        SUM(status = 'blocked') AS blocked,
        SUM(priority = 'urgent') AS urgent,
        SUM(dueDate < CURDATE() AND status != 'done') AS overdue
      FROM tasks WHERE userId = ? AND archived = FALSE`,
      [userId]
    );
    const [byCategory] = await pool.query(
      'SELECT category, COUNT(*) AS count FROM tasks WHERE userId = ? AND archived = FALSE GROUP BY category',
      [userId]
    );
    return res.json({ totals, byCategory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = { getAll, getOne, create, update, remove, getMetrics };
