const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../db/connection');

const SYSTEM_PROMPT = `Eres un asistente de gestión de tareas técnicas para developers.
Dado una descripción de trabajo, genera una lista estructurada de tareas técnicas accionables.
Responde SOLO con un JSON array válido, sin markdown ni texto adicional.
Cada tarea debe tener esta estructura exacta:
{
  "title": "Título conciso (máx 200 chars)",
  "description": "Descripción detallada de qué hacer y cómo",
  "priority": "low|medium|high|urgent",
  "category": "frontend|backend|database|devops|documentation|other",
  "subtasks": [
    {"title": "Subtarea 1"},
    {"title": "Subtarea 2"}
  ]
}
Genera entre 3 y 6 tareas específicas, técnicas y accionables. Cada tarea debe tener 2-5 subtareas.`;

async function generateTasks(req, res) {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: 'El prompt es requerido' });
  }

  if (!process.env.CLAUDE_API_KEY) {
    return res.status(503).json({ message: 'CLAUDE_API_KEY no configurada en el servidor' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt.trim() }],
    });

    const raw = message.content[0].text.trim();
    const taskList = JSON.parse(raw);

    const created = [];
    for (const task of taskList) {
      const [result] = await pool.query(
        'INSERT INTO tasks (userId, title, description, status, priority, category, isAIGenerated) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
        [req.user.id, task.title, task.description || null, 'todo', task.priority || 'medium', task.category || 'other']
      );

      if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
        for (const st of task.subtasks) {
          await pool.query('INSERT INTO subtasks (taskId, title) VALUES (?, ?)', [result.insertId, st.title]);
        }
      }

      const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
      const [subs] = await pool.query('SELECT * FROM subtasks WHERE taskId = ? ORDER BY id ASC', [result.insertId]);
      created.push({ ...rows[0], subtasks: subs });
    }

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ message: 'La IA no devolvió JSON válido, intenta de nuevo' });
    }
    return res.status(500).json({ message: 'Error al generar tareas con IA' });
  }
}

module.exports = { generateTasks };
