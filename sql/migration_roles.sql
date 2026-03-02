-- Migration: Restructure roles — Admin / Socio / Usuario
-- Run this once to migrate existing data

-- 1. Convert all Directors to Admin
UPDATE socios SET role = 'Admin' WHERE role = 'Director';

-- 2. Change default role to Usuario
ALTER TABLE socios MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'Usuario';
