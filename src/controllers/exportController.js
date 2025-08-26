const db = require("../database/connection");

exports.exportNotifications = async (req, res, next) => {
  try {
    const { format = "csv", status, channel, days = 7 } = req.query;

    let query = `
      SELECT 
        id,
        recipient,
        channel,
        subject,
        content,
        status,
        attempts,
        created_at,
        updated_at
      FROM notifications
      WHERE created_at >= NOW() - INTERVAL '${days} days'
    `;

    const params = [];
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (channel) {
      params.push(channel);
      query += ` AND channel = $${params.length}`;
    }

    query += " ORDER BY created_at DESC";

    const result = await db.query(query, params);

    if (format === "csv") {
      // Generate CSV
      const rows = result.rows;
      const headers = Object.keys(rows[0] || {}).join(",");
      const csv = [
        headers,
        ...rows.map((row) =>
          Object.values(row)
            .map((val) =>
              typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val
            )
            .join(",")
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="notifications_${
          new Date().toISOString().split("T")[0]
        }.csv"`
      );
      res.send(csv);
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    console.error("Export error:", error);
    next(error);
  }
};
