-- Additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
  ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_status 
  ON notifications(recipient, status);

CREATE INDEX IF NOT EXISTS idx_queue_run_at 
  ON notification_queue(run_at) 
  WHERE status = 'pending';