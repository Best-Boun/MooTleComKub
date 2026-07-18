-- Migration: Seed spec_templates with the confirmed field list per category
-- Idempotent: safe to run twice (INSERT IGNORE + unique_category_spec constraint)
-- Category is resolved by TRIM(REPLACE(category_name, '\t', '')) — the "CPU" row in
-- categories has a stray leading TAB + space in its name. MySQL's TRIM() only
-- strips plain spaces (0x20), not tab characters (0x09), so a bare TRIM() would
-- silently seed zero rows for it. The REPLACE removes the tab first, then TRIM
-- removes the remaining leading space.

-- CPU
INSERT IGNORE INTO spec_templates (category_id, spec_name)
SELECT c.category_id, s.spec_name
FROM categories c
JOIN (
  SELECT 'Socket' AS spec_name UNION ALL
  SELECT 'Cores' UNION ALL
  SELECT 'Threads' UNION ALL
  SELECT 'Base Clock' UNION ALL
  SELECT 'Boost Clock' UNION ALL
  SELECT 'Cache (L3)' UNION ALL
  SELECT 'TDP' UNION ALL
  SELECT 'Integrated Graphics' UNION ALL
  SELECT 'Generation'
) s
WHERE TRIM(REPLACE(c.category_name, '	', '')) = 'CPU';

-- GPU
INSERT IGNORE INTO spec_templates (category_id, spec_name)
SELECT c.category_id, s.spec_name
FROM categories c
JOIN (
  SELECT 'Chipset' AS spec_name UNION ALL
  SELECT 'VRAM' UNION ALL
  SELECT 'Memory Type' UNION ALL
  SELECT 'Core Clock' UNION ALL
  SELECT 'Boost Clock' UNION ALL
  SELECT 'Interface' UNION ALL
  SELECT 'Power Connector' UNION ALL
  SELECT 'Recommended PSU' UNION ALL
  SELECT 'Ports'
) s
WHERE TRIM(REPLACE(c.category_name, '	', '')) = 'GPU';

-- RAM
INSERT IGNORE INTO spec_templates (category_id, spec_name)
SELECT c.category_id, s.spec_name
FROM categories c
JOIN (
  SELECT 'Capacity' AS spec_name UNION ALL
  SELECT 'Speed' UNION ALL
  SELECT 'CAS Latency' UNION ALL
  SELECT 'Timing' UNION ALL
  SELECT 'Voltage' UNION ALL
  SELECT 'Color' UNION ALL
  SELECT 'Heat Spreader' UNION ALL
  SELECT 'Type' UNION ALL
  SELECT 'Warranty'
) s
WHERE TRIM(REPLACE(c.category_name, '	', '')) = 'RAM';

-- SSD
INSERT IGNORE INTO spec_templates (category_id, spec_name)
SELECT c.category_id, s.spec_name
FROM categories c
JOIN (
  SELECT 'Capacity' AS spec_name UNION ALL
  SELECT 'Form Factor' UNION ALL
  SELECT 'Interface' UNION ALL
  SELECT 'Read Speed' UNION ALL
  SELECT 'Write Speed' UNION ALL
  SELECT 'NAND Type' UNION ALL
  SELECT 'Endurance (TBW)' UNION ALL
  SELECT 'Warranty'
) s
WHERE TRIM(REPLACE(c.category_name, '	', '')) = 'SSD';

-- Monitor
INSERT IGNORE INTO spec_templates (category_id, spec_name)
SELECT c.category_id, s.spec_name
FROM categories c
JOIN (
  SELECT 'Screen Size' AS spec_name UNION ALL
  SELECT 'Panel Type' UNION ALL
  SELECT 'Resolution' UNION ALL
  SELECT 'Refresh Rate' UNION ALL
  SELECT 'Response Time' UNION ALL
  SELECT 'Aspect Ratio' UNION ALL
  SELECT 'Ports' UNION ALL
  SELECT 'VESA Mount'
) s
WHERE TRIM(REPLACE(c.category_name, '	', '')) = 'Monitor';

-- Mainboard
INSERT IGNORE INTO spec_templates (category_id, spec_name)
SELECT c.category_id, s.spec_name
FROM categories c
JOIN (
  SELECT 'Socket' AS spec_name UNION ALL
  SELECT 'Chipset' UNION ALL
  SELECT 'Form Factor' UNION ALL
  SELECT 'Memory Support' UNION ALL
  SELECT 'PCIe Slots' UNION ALL
  SELECT 'M.2 Slots' UNION ALL
  SELECT 'Rear Ports' UNION ALL
  SELECT 'Wi-Fi/Bluetooth'
) s
WHERE TRIM(REPLACE(c.category_name, '	', '')) = 'Mainboard';

-- Notebook
INSERT IGNORE INTO spec_templates (category_id, spec_name)
SELECT c.category_id, s.spec_name
FROM categories c
JOIN (
  SELECT 'CPU' AS spec_name UNION ALL
  SELECT 'GPU' UNION ALL
  SELECT 'RAM' UNION ALL
  SELECT 'Storage' UNION ALL
  SELECT 'Display' UNION ALL
  SELECT 'Battery' UNION ALL
  SELECT 'Weight' UNION ALL
  SELECT 'Ports'
) s
WHERE TRIM(REPLACE(c.category_name, '	', '')) = 'Notebook';

-- Computer Set
INSERT IGNORE INTO spec_templates (category_id, spec_name)
SELECT c.category_id, s.spec_name
FROM categories c
JOIN (
  SELECT 'CPU' AS spec_name UNION ALL
  SELECT 'GPU' UNION ALL
  SELECT 'RAM' UNION ALL
  SELECT 'Storage' UNION ALL
  SELECT 'Mainboard' UNION ALL
  SELECT 'Power Supply' UNION ALL
  SELECT 'Case' UNION ALL
  SELECT 'Cooling'
) s
WHERE TRIM(REPLACE(c.category_name, '	', '')) = 'Computer Set';
