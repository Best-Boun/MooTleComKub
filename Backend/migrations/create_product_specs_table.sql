-- Migration: Create product_specs table for Compare Products feature
-- Actual spec values per product, filled in by Admin when adding/editing a product

CREATE TABLE IF NOT EXISTS product_specs (
  spec_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  spec_name VARCHAR(100) NOT NULL,
  spec_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_spec (product_id, spec_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
