-- RTK v5.0 Database Schema
-- MySQL Integration Layer

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  path TEXT NOT NULL,
  tech_stack VARCHAR(255),
  last_indexed TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tasks table (agent state)
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(100) PRIMARY KEY,
  project VARCHAR(100) NOT NULL,
  goal TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  current_step INT DEFAULT 0,
  total_steps INT DEFAULT 0,
  steps JSON,
  result JSON,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_project (project),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Activity logs (audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project VARCHAR(100) NOT NULL,
  task_id VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  file_path TEXT,
  message TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project (project),
  INDEX idx_task (task_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- File index tracking
CREATE TABLE IF NOT EXISTS file_index (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  file_hash VARCHAR(64),
  last_indexed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  embedding_id VARCHAR(100),
  chunk_count INT DEFAULT 0,
  INDEX idx_project (project),
  INDEX idx_hash (file_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Index statistics
CREATE TABLE IF NOT EXISTS index_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project VARCHAR(100) UNIQUE NOT NULL,
  total_files INT DEFAULT 0,
  total_chunks INT DEFAULT 0,
  last_full_index TIMESTAMP NULL,
  last_incremental_index TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
