const db = require("../connection");

class TemplateRepository {
  // Get all templates
  async findAll() {
    const result = await db.query(
      "SELECT * FROM templates WHERE is_active = true ORDER BY created_at DESC"
    );
    return result.rows;
  }

  // Get single template by ID
  async findById(id) {
    const result = await db.query("SELECT * FROM templates WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  // Get single template by name
  async findByName(name) {
    const result = await db.query(
      "SELECT * FROM templates WHERE name = $1 AND is_active = true",
      [name]
    );
    return result.rows[0];
  }

  // Create new template
  async create(data) {
    const {
      name,
      description,
      subject,
      content,
      html_content,
      channel,
      variables,
    } = data;
    const result = await db.query(
      `
      INSERT INTO templates (name, description, subject, content, html_content, channel, variables)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [
        name,
        description,
        subject,
        content,
        html_content,
        channel,
        JSON.stringify(variables || []),
      ]
    );
    return result.rows[0];
  }

  // Update template status
  async update(id, data) {
    const { description, subject, content, html_content, is_active } = data;
    const result = await db.query(
      `
      UPDATE templates 
      SET description = $1, subject = $2, content = $3, html_content = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `,
      [description, subject, content, html_content, is_active, id]
    );
    return result.rows[0];
  }

  // Delete template
  async delete(id) {
    const result = await db.query(
      "UPDATE templates SET is_active = false WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new TemplateRepository();