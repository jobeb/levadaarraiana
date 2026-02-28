-- ============================================================
-- Levada Arraiana — Migration v2
-- Run after schema.sql is deployed
-- ============================================================

SET NAMES utf8mb4;

-- Fase 3: Ensaios recurrentes
ALTER TABLE ensaios ADD COLUMN recorrencia VARCHAR(20) DEFAULT NULL;
ALTER TABLE ensaios ADD COLUMN recorrencia_fin DATE DEFAULT NULL;
ALTER TABLE ensaios ADD COLUMN grupo_recorrencia INT DEFAULT NULL;

-- Fase 9: Mensaxería respuestas
ALTER TABLE mensaxes ADD COLUMN en_resposta_a INT DEFAULT NULL;

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

-- Fase 11: Setlists
CREATE TABLE IF NOT EXISTS `setlists` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(255) NOT NULL DEFAULT '',
    `descricion` TEXT DEFAULT NULL,
    `bolo_id` INT DEFAULT NULL,
    `creado` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `setlist_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setlist_id` INT NOT NULL,
    `repertorio_id` INT NOT NULL,
    `orde` INT NOT NULL DEFAULT 0,
    `notas` TEXT DEFAULT NULL,
    CONSTRAINT `fk_sli_setlist` FOREIGN KEY (`setlist_id`) REFERENCES `setlists`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_sli_repertorio` FOREIGN KEY (`repertorio_id`) REFERENCES `repertorio`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fase 12C: Votación fecha límite
ALTER TABLE votacions ADD COLUMN data_limite DATE DEFAULT NULL;

-- Fase 12D: Historial de mantenimiento de instrumentos
ALTER TABLE instrumentos ADD COLUMN historial_mantemento JSON DEFAULT NULL;
