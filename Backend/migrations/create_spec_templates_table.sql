-- Migration: Create spec_templates table for Compare Products feature
-- SuperAdmin defines which spec fields exist per category ahead of time

CREATE TABLE IF NOT EXISTS spec_templates (
  template_id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  spec_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
  UNIQUE KEY unique_category_spec (category_id, spec_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
