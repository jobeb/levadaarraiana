-- ============================================================
-- Levada Arraiana — Migration v2
-- Run after schema.sql is deployed
-- ============================================================

SET NAMES utf8mb4;

-- Fase 3: Ensaios recurrentes
ALTER TABLE ensaios ADD COLUMN recorrencia VARCHAR(20) DEFAULT NULL;
ALTER TABLE ensaios ADD COLUMN recorrencia_fin DATE DEFAULT NULL;
ALTER TABLE ensaios ADD COLUMN grupo_recorrencia INT DEFAULT NULL;

-- Fase 10: Votación de propostas
CREATE TABLE IF NOT EXISTS `propostas_votos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `proposta_id` INT NOT NULL,
    `socio_id` INT NOT NULL,
    `voto` TINYINT NOT NULL DEFAULT 1,
    UNIQUE KEY `uq_proposta_socio` (`proposta_id`, `socio_id`),
    CONSTRAINT `fk_pvoto_proposta` FOREIGN KEY (`proposta_id`) REFERENCES `propostas`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pvoto_socio` FOREIGN KEY (`socio_id`) REFERENCES `socios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Fase 12C: Votación fecha límite
ALTER TABLE votacions ADD COLUMN data_limite DATE DEFAULT NULL;

-- Fase 12D: Historial de mantenimiento de instrumentos
ALTER TABLE instrumentos ADD COLUMN historial_mantemento JSON DEFAULT NULL;
