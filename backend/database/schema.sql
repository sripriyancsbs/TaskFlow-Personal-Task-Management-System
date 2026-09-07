-- ===================================================
-- TaskFlow Database Schema (PostgreSQL)
-- ===================================================

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_task_status CHECK (status IN ('Pending', 'Completed')),
  CONSTRAINT chk_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- Index for faster filtering and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
