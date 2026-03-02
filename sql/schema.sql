-- ============================================================
-- Levada Arraiana — Esquema de Base de Datos
-- BD: levadaarraiana (MySQL / MariaDB)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Usuarios (miembros)
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `nome_completo` varchar(255) NOT NULL DEFAULT '',
  `dni` varchar(50) NOT NULL DEFAULT '',
  `email` varchar(255) DEFAULT '',
  `telefono` varchar(100) NOT NULL DEFAULT '',
  `instrumento` varchar(100) NOT NULL DEFAULT '',
  `role` varchar(50) NOT NULL DEFAULT 'Usuario',
  `estado` varchar(50) NOT NULL DEFAULT 'Activo',
  `password` varchar(512) NOT NULL DEFAULT '',
  `foto` varchar(512) NOT NULL DEFAULT '',
  `data_alta` date DEFAULT NULL,
  `session_token` varchar(255) DEFAULT NULL,
  `session_expires` datetime DEFAULT NULL,
  `ultimo_login` datetime DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Noticias
DROP TABLE IF EXISTS `noticias`;
CREATE TABLE `noticias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(500) NOT NULL DEFAULT '',
  `texto` longtext DEFAULT NULL,
  `data` date DEFAULT NULL,
  `autor` varchar(100) NOT NULL DEFAULT '',
  `imaxes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`imaxes`)),
  `estado` varchar(50) NOT NULL DEFAULT 'publicada',
  `publica` tinyint(1) NOT NULL DEFAULT 0,
  `i18n` JSON DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bolos (actuaciones — unifica eventos + contratos)
DROP TABLE IF EXISTS `bolos`;
CREATE TABLE `bolos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(500) NOT NULL DEFAULT '',
  `descricion` text DEFAULT NULL,
  `data` date DEFAULT NULL,
  `hora` varchar(10) NOT NULL DEFAULT '',
  `lugar` varchar(500) NOT NULL DEFAULT '',
  `tipo` varchar(50) NOT NULL DEFAULT 'actuacion',
  `imaxe` varchar(512) NOT NULL DEFAULT '',
  `cliente_nome` varchar(255) NOT NULL DEFAULT '',
  `cliente_nif` varchar(50) NOT NULL DEFAULT '',
  `cliente_telefono` varchar(100) NOT NULL DEFAULT '',
  `importe` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notas` text DEFAULT NULL,
  `contrato_arquivo` varchar(512) NOT NULL DEFAULT '',
  `estado` varchar(50) NOT NULL DEFAULT 'borrador',
  `publica` tinyint(1) NOT NULL DEFAULT 0,
  `i18n` JSON DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Álbumes de fotos
DROP TABLE IF EXISTS `albums`;
CREATE TABLE `albums` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(500) NOT NULL DEFAULT '',
  `descricion` text DEFAULT NULL,
  `data` date DEFAULT NULL,
  `portada` varchar(512) NOT NULL DEFAULT '',
  `fotos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fotos`)),
  `i18n` JSON DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Propostas
DROP TABLE IF EXISTS `propostas`;
CREATE TABLE `propostas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(500) NOT NULL DEFAULT '',
  `texto` longtext DEFAULT NULL,
  `data` date DEFAULT NULL,
  `autor` varchar(100) NOT NULL DEFAULT '',
  `autor_nome` varchar(255) NOT NULL DEFAULT '',
  `ficheiros` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ficheiros`)),
  `estado` varchar(20) NOT NULL DEFAULT 'aberta',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Documentos
DROP TABLE IF EXISTS `documentos`;
CREATE TABLE `documentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(500) NOT NULL DEFAULT '',
  `descricion` text DEFAULT NULL,
  `visibilidade` varchar(50) NOT NULL DEFAULT 'todos',
  `arquivo` varchar(512) NOT NULL DEFAULT '',
  `arquivo_nome` varchar(255) NOT NULL DEFAULT '',
  `creado` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Actas de reuniones
DROP TABLE IF EXISTS `actas`;
CREATE TABLE `actas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(500) NOT NULL DEFAULT '',
  `data` date DEFAULT NULL,
  `contido` longtext DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'borrador',
  `arquivos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`arquivos`)),
  `creado` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Votacións
DROP TABLE IF EXISTS `votacions`;
CREATE TABLE `votacions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(500) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `opcions` text NOT NULL,
  `estado` varchar(20) DEFAULT 'aberta',
  `anonima` tinyint(1) NOT NULL DEFAULT 0,
  `tipo` varchar(20) NOT NULL DEFAULT 'simple',
  `max_opcions` int(11) DEFAULT NULL,
  `imaxe` varchar(512) NOT NULL DEFAULT '',
  `creado` datetime DEFAULT current_timestamp(),
  `pechado_en` datetime DEFAULT NULL,
  `data_limite` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Votos
DROP TABLE IF EXISTS `votos`;
CREATE TABLE `votos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `votacion_id` int(11) NOT NULL,
  `socio_id` int(11) NOT NULL,
  `opcion` varchar(500) NOT NULL,
  `comentario` text DEFAULT NULL,
  `creado` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_voto` (`votacion_id`, `socio_id`, `opcion`),
  CONSTRAINT `fk_voto_votacion` FOREIGN KEY (`votacion_id`) REFERENCES `votacions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_voto_usuario` FOREIGN KEY (`socio_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Ensayos
DROP TABLE IF EXISTS `ensaios`;
CREATE TABLE `ensaios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `data` date DEFAULT NULL,
  `hora_inicio` varchar(10) NOT NULL DEFAULT '',
  `hora_fin` varchar(10) NOT NULL DEFAULT '',
  `lugar` varchar(500) NOT NULL DEFAULT '',
  `notas` text DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'programado',
  `recorrencia` varchar(20) DEFAULT NULL,
  `recorrencia_fin` date DEFAULT NULL,
  `grupo_recorrencia` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Asistencia a ensayos
DROP TABLE IF EXISTS `asistencia`;
CREATE TABLE `asistencia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ensaio_id` int(11) NOT NULL,
  `socio_id` int(11) NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'confirmado',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asistencia` (`ensaio_id`, `socio_id`),
  CONSTRAINT `fk_asist_ensaio` FOREIGN KEY (`ensaio_id`) REFERENCES `ensaios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asist_usuario` FOREIGN KEY (`socio_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Instrumentos
DROP TABLE IF EXISTS `instrumentos`;
CREATE TABLE `instrumentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL DEFAULT '',
  `tipo` varchar(100) NOT NULL DEFAULT '',
  `numero_serie` varchar(255) NOT NULL DEFAULT '',
  `estado` varchar(50) NOT NULL DEFAULT 'bo',
  `asignado_a` int(11) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `descricion` longtext DEFAULT NULL,
  `imaxe` varchar(512) NOT NULL DEFAULT '',
  `historial_mantemento` JSON DEFAULT NULL,
  `i18n` JSON DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_instrum_usuario` FOREIGN KEY (`asignado_a`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Repertorio (ritmos/canciones)
DROP TABLE IF EXISTS `repertorio`;
CREATE TABLE `repertorio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL DEFAULT '',
  `tipo` varchar(100) NOT NULL DEFAULT '',
  `tempo_bpm` int(11) DEFAULT NULL,
  `dificultade` varchar(50) NOT NULL DEFAULT 'media',
  `notas` text DEFAULT NULL,
  `arquivo_audio` varchar(512) NOT NULL DEFAULT '',
  `arquivo_partitura` varchar(512) NOT NULL DEFAULT '',
  `estructura` JSON DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21b. Repertorio Medios (audio/video por ritmo, parte e instrumento)
DROP TABLE IF EXISTS `repertorio_medios`;
CREATE TABLE `repertorio_medios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `repertorio_id` INT NOT NULL,
  `parte_idx` INT NOT NULL DEFAULT -1,
  `instrumento_id` INT NOT NULL DEFAULT 0,
  `arquivo` VARCHAR(512) NOT NULL DEFAULT '',
  `arquivo_nome` VARCHAR(255) NOT NULL DEFAULT '',
  `tipo_media` VARCHAR(20) NOT NULL DEFAULT 'audio',
  `creado` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_slot` (`repertorio_id`, `parte_idx`, `instrumento_id`),
  CONSTRAINT `fk_medio_rep` FOREIGN KEY (`repertorio_id`) REFERENCES `repertorio`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Configuración (singleton)
DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
  `id` int(11) NOT NULL DEFAULT 1,
  `nome_asociacion` varchar(500) NOT NULL DEFAULT 'Levada Arraiana',
  `smtp_host` varchar(255) NOT NULL DEFAULT '',
  `smtp_port` int(11) NOT NULL DEFAULT 587,
  `smtp_user` varchar(255) NOT NULL DEFAULT '',
  `smtp_pass` varchar(255) NOT NULL DEFAULT '',
  `smtp_from` varchar(255) NOT NULL DEFAULT '',
  `smtp_cifrado` varchar(10) NOT NULL DEFAULT 'TLS',
  `email_dest` varchar(255) NOT NULL DEFAULT '',
  `fiscal_nome` varchar(255) DEFAULT '',
  `fiscal_nif` varchar(50) DEFAULT '',
  `fiscal_enderezo` varchar(255) DEFAULT '',
  `fiscal_cp` varchar(10) DEFAULT '',
  `fiscal_localidade` varchar(100) DEFAULT '',
  `fiscal_provincia` varchar(100) DEFAULT '',
  `fiscal_telefono` varchar(30) DEFAULT '',
  `fiscal_email` varchar(255) DEFAULT '',
  `sobre_nos_gl` text DEFAULT NULL,
  `sobre_nos_es` text DEFAULT NULL,
  `sobre_nos_pt` text DEFAULT NULL,
  `sobre_nos_en` text DEFAULT NULL,
  `youtube_client_id` varchar(512) DEFAULT '',
  `youtube_client_secret` varchar(512) DEFAULT '',
  `comentarios_moderacion` tinyint(1) NOT NULL DEFAULT 0,
  `cal_cor_ensaios` varchar(20) NOT NULL DEFAULT '#e3c300',
  `cal_cor_bolos` varchar(20) NOT NULL DEFAULT '#ff9800',
  `cal_cor_noticias` varchar(20) NOT NULL DEFAULT '#005f97',
  `cal_cor_votacions` varchar(20) NOT NULL DEFAULT '#a50d3d',
  `gate_password` varchar(255) NOT NULL DEFAULT 'levada2026',
  PRIMARY KEY (`id`),
  CONSTRAINT `config_singleton` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default config row
INSERT INTO `config` (`id`, `nome_asociacion`, `gate_password`, `sobre_nos_gl`, `sobre_nos_es`, `sobre_nos_pt`, `sobre_nos_en`) VALUES (
  1,
  'Levada Arraiana',
  'levada2026',
  'A Levada Arraiana é un grupo de batucada con sede en Estás, Tomiño (Pontevedra), na fronteira entre Galicia e Portugal. Nacemos da paixón polo ritmo e pola cultura de percusión brasileira, adaptándoa ao noso contexto galego.\n\nOs nosos instrumentos — surdos, caixas, repiniques, tamborins, agogôs, ganzás e apitos — crean unha enerxía colectiva que fai vibrar rúas, festas e festivais. Ensaiamos regularmente para manter un repertorio vivo e en constante evolución.\n\nSe che gusta a percusión e queres formar parte dunha comunidade musical aberta e participativa, a Levada Arraiana agárdache. Non precisas experiencia previa — só ganas de tocar!',
  'Levada Arraiana es un grupo de batucada con sede en Estás, Tomiño (Pontevedra), en la frontera entre Galicia y Portugal. Nacimos de la pasión por el ritmo y por la cultura de percusión brasileña, adaptándola a nuestro contexto gallego.\n\nNuestros instrumentos — surdos, cajas, repiniques, tamborines, agogôs, ganzás y apitos — crean una energía colectiva que hace vibrar calles, fiestas y festivales. Ensayamos regularmente para mantener un repertorio vivo y en constante evolución.\n\nSi te gusta la percusión y quieres formar parte de una comunidad musical abierta y participativa, Levada Arraiana te espera. No necesitas experiencia previa — ¡solo ganas de tocar!',
  'A Levada Arraiana é um grupo de batucada com sede em Estás, Tomiño (Pontevedra), na fronteira entre a Galiza e Portugal. Nascemos da paixão pelo ritmo e pela cultura de percussão brasileira, adaptando-a ao nosso contexto galego.\n\nOs nossos instrumentos — surdos, caixas, repiniques, tamborins, agogôs, ganzás e apitos — criam uma energia coletiva que faz vibrar ruas, festas e festivais. Ensaiamos regularmente para manter um repertório vivo e em constante evolução.\n\nSe gostas de percussão e queres fazer parte de uma comunidade musical aberta e participativa, a Levada Arraiana espera por ti. Não precisas de experiência prévia — só vontade de tocar!',
  'Levada Arraiana is a batucada group based in Estás, Tomiño (Pontevedra), on the border between Galicia and Portugal. We were born from a passion for rhythm and Brazilian percussion culture, adapting it to our Galician context.\n\nOur instruments — surdos, snare drums, repiniques, tamborims, agogôs, ganzás and whistles — create a collective energy that makes streets, festivals and celebrations come alive. We rehearse regularly to keep our repertoire fresh and constantly evolving.\n\nIf you love percussion and want to be part of an open and participatory musical community, Levada Arraiana is waiting for you. No previous experience needed — just the desire to play!'
);

-- 23. Comentarios (polimórfico: noticias + bolos)
DROP TABLE IF EXISTS `comentarios`;
CREATE TABLE `comentarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_type` varchar(50) NOT NULL,
  `item_id` int(11) NOT NULL,
  `texto` text NOT NULL,
  `autor_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `estado` enum('pendente','aprobado','rexeitado') NOT NULL DEFAULT 'aprobado',
  `creado` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_item` (`item_type`, `item_id`),
  KEY `idx_parent` (`parent_id`),
  CONSTRAINT `fk_comentario_autor` FOREIGN KEY (`autor_id`)
    REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comentario_parent` FOREIGN KEY (`parent_id`)
    REFERENCES `comentarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Landing sections (fondos configurables)
DROP TABLE IF EXISTS `landing_seccions`;
CREATE TABLE `landing_seccions` (
  `id` VARCHAR(30) NOT NULL PRIMARY KEY,
  `bg_imaxe` VARCHAR(512) NOT NULL DEFAULT '',
  `bg_video` VARCHAR(512) NOT NULL DEFAULT '',
  `bg_cor` VARCHAR(20) NOT NULL DEFAULT '',
  `parallax` TINYINT(1) NOT NULL DEFAULT 0,
  `overlay_opacidade` DECIMAL(3,2) NOT NULL DEFAULT 0.70,
  `max_items` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO landing_seccions (id) VALUES
  ('hero'),('noticias'),('bolos'),('bolos_pasados'),
  ('presuposto'),('galeria'),('instrumentos'),('sobre_nos');

-- 25. Solicitudes de contratacion de bolos
DROP TABLE IF EXISTS `solicitudes_bolos`;
CREATE TABLE `solicitudes_bolos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL DEFAULT '',
  `email` VARCHAR(255) NOT NULL DEFAULT '',
  `telefono` VARCHAR(100) NOT NULL DEFAULT '',
  `data_evento` DATE DEFAULT NULL,
  `lugar` VARCHAR(500) NOT NULL DEFAULT '',
  `tipo` VARCHAR(100) NOT NULL DEFAULT '',
  `descricion` TEXT DEFAULT NULL,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'pendente',
  `notas` TEXT DEFAULT NULL,
  `creado` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
