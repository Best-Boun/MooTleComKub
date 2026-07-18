-- Migration: Backfill product_specs from the old fixed columns on products
-- Only touches Notebook / Computer Set rows (the only categories that ever had
-- these columns populated through the old UI). Skips null/empty values.
-- Idempotent: safe to run twice via INSERT IGNORE + unique_product_spec constraint.
-- Category is resolved by TRIM(category_name) — see seed_spec_templates.sql for why.
-- Does NOT drop the old columns — that is a separate later migration.

-- CPU (Notebook + Computer Set)
INSERT IGNORE INTO product_specs (product_id, spec_name, spec_value)
SELECT p.product_id, 'CPU', p.cpu
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE TRIM(c.category_name) IN ('Notebook', 'Computer Set')
  AND p.cpu IS NOT NULL AND TRIM(p.cpu) <> '';

-- GPU (Notebook + Computer Set)
INSERT IGNORE INTO product_specs (product_id, spec_name, spec_value)
SELECT p.product_id, 'GPU', p.gpu
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE TRIM(c.category_name) IN ('Notebook', 'Computer Set')
  AND p.gpu IS NOT NULL AND TRIM(p.gpu) <> '';

-- RAM (Notebook + Computer Set)
INSERT IGNORE INTO product_specs (product_id, spec_name, spec_value)
SELECT p.product_id, 'RAM', p.ram
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE TRIM(c.category_name) IN ('Notebook', 'Computer Set')
  AND p.ram IS NOT NULL AND TRIM(p.ram) <> '';

-- Storage (Notebook + Computer Set)
INSERT IGNORE INTO product_specs (product_id, spec_name, spec_value)
SELECT p.product_id, 'Storage', p.storage
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE TRIM(c.category_name) IN ('Notebook', 'Computer Set')
  AND p.storage IS NOT NULL AND TRIM(p.storage) <> '';

-- Display (Notebook only — not part of the Computer Set template)
INSERT IGNORE INTO product_specs (product_id, spec_name, spec_value)
SELECT p.product_id, 'Display', p.display
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE TRIM(c.category_name) = 'Notebook'
  AND p.display IS NOT NULL AND TRIM(p.display) <> '';

-- Mainboard (Computer Set only — not part of the Notebook template)
INSERT IGNORE INTO product_specs (product_id, spec_name, spec_value)
SELECT p.product_id, 'Mainboard', p.mainboard
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE TRIM(c.category_name) = 'Computer Set'
  AND p.mainboard IS NOT NULL AND TRIM(p.mainboard) <> '';

-- Power Supply (Computer Set only)
INSERT IGNORE INTO product_specs (product_id, spec_name, spec_value)
SELECT p.product_id, 'Power Supply', p.power_supply
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE TRIM(c.category_name) = 'Computer Set'
  AND p.power_supply IS NOT NULL AND TRIM(p.power_supply) <> '';

-- Case (Computer Set only)
INSERT IGNORE INTO product_specs (product_id, spec_name, spec_value)
SELECT p.product_id, 'Case', p.case_name
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE TRIM(c.category_name) = 'Computer Set'
  AND p.case_name IS NOT NULL AND TRIM(p.case_name) <> '';

-- Cooling (Computer Set only)
INSERT IGNORE INTO product_specs (product_id, spec_name, spec_value)
SELECT p.product_id, 'Cooling', p.cooling
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE TRIM(c.category_name) = 'Computer Set'
  AND p.cooling IS NOT NULL AND TRIM(p.cooling) <> '';
