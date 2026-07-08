/**
 * =========================================================
 * 迁移文件：002_create_games.sql
 * =========================================================
 * 功能说明：创建 games 游戏记录表
 * - 存储每一局游戏的进度、答案、得分
 * - 通过 case_id 关联 cases 表
 * - 用户标识 user_id 可为 session id 或浏览器 fingerprint
 * =========================================================
 */

CREATE TABLE IF NOT EXISTS `games` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `case_id` INT UNSIGNED NOT NULL COMMENT '关联案卷 ID',
  `user_id` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '用户标识',
  `status` ENUM('playing', 'completed', 'abandoned') NOT NULL DEFAULT 'playing' COMMENT '游戏状态',
  `score` INT NOT NULL DEFAULT 0 COMMENT '得分',
  `answers` JSON NOT NULL COMMENT '用户答案记录',
  `completed_at` TIMESTAMP NULL DEFAULT NULL COMMENT '完成时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_case_id` (`case_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_games_case_id`
    FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏记录表';
