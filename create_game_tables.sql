-- 游戏管理系统数据库表结构

-- 1. 游戏配置表
CREATE TABLE IF NOT EXISTS `game_configs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '配置名称',
  `type` varchar(50) NOT NULL COMMENT '配置类型',
  `value` text NOT NULL COMMENT '配置值',
  `description` varchar(255) DEFAULT NULL COMMENT '配置描述',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏配置表';

-- 2. 游戏玩家表
CREATE TABLE IF NOT EXISTS `game_players` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) NOT NULL COMMENT '微信OpenID',
  `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `best_score` int(11) NOT NULL DEFAULT '0' COMMENT '最高分数',
  `total_games` int(11) NOT NULL DEFAULT '0' COMMENT '游戏次数',
  `total_playtime` int(11) NOT NULL DEFAULT '0' COMMENT '总游戏时间',
  `last_played_at` timestamp NULL DEFAULT NULL COMMENT '最后游戏时间',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_best_score` (`best_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏玩家表';