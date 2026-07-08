/**
 * =========================================================
 * 迁移文件：001_create_cases.sql
 * =========================================================
 * 功能说明：创建 cases 案卷表
 * - 存储知识侦探的推理案卷内容
 * - 支持分类、难度、JSON 线索/选项/解析/知识卡
 * - is_seed 用于区分种子数据与 AI 生成数据
 * =========================================================
 */

CREATE TABLE IF NOT EXISTS `cases` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT '案卷标题',
  `subtitle` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '副标题',
  `category` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '分类标签',
  `difficulty` INT NOT NULL DEFAULT 1 COMMENT '难度 1-5',
  `scene` TEXT NOT NULL COMMENT '场景描述',
  `clues` JSON NOT NULL COMMENT '线索数组',
  `question` TEXT NOT NULL COMMENT '推理问题',
  `options` JSON NOT NULL COMMENT '选项数组',
  `analysis` JSON NOT NULL COMMENT '解析',
  `card` JSON NOT NULL COMMENT '知识卡',
  `is_seed` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否种子数据',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_is_seed` (`is_seed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='案卷表';
