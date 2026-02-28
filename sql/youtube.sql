-- ============================================================
-- YouTube Integration — Tokens + Config columns
-- Executar sobre a BD levadaarraiana
-- ============================================================

-- Tabla para almacenar tokens OAuth de YouTube
CREATE TABLE IF NOT EXISTS `youtube_tokens` (
  `id` int(11) NOT NULL DEFAULT 1,
  `access_token` text DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `channel_name` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Engadir columnas de credenciais YouTube á tabla config
ALTER TABLE `config`
  ADD COLUMN IF NOT EXISTS `youtube_client_id` varchar(512) DEFAULT '',
  ADD COLUMN IF NOT EXISTS `youtube_client_secret` varchar(512) DEFAULT '';
