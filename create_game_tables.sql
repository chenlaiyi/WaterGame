-- 游戏管理系统数据库表结构

-- 1. 游戏配置表
CREATE TABLE IF NOT EXISTS `game_configs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL COMMENT '配置键名',
  `config_name` varchar(100) NOT NULL COMMENT '配置名称',
  `config_value` text NOT NULL COMMENT '配置值',
  `config_type` varchar(50) NOT NULL COMMENT '配置类型',
  `description` varchar(255) DEFAULT NULL COMMENT '配置描述',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`),
  KEY `idx_config_type` (`config_type`),
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

-- 3. 游戏会话表
CREATE TABLE IF NOT EXISTS `game_sessions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `player_id` bigint(20) unsigned NOT NULL COMMENT '玩家ID',
  `level` int(11) NOT NULL DEFAULT '1' COMMENT '关卡',
  `score` int(11) NOT NULL DEFAULT '0' COMMENT '得分',
  `duration` int(11) NOT NULL DEFAULT '0' COMMENT '游戏时长(秒)',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态(1:进行中,2:完成,3:失败)',
  `start_time` timestamp NULL DEFAULT NULL COMMENT '开始时间',
  `end_time` timestamp NULL DEFAULT NULL COMMENT '结束时间',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_player_id` (`player_id`),
  KEY `idx_level` (`level`),
  KEY `idx_score` (`score`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏会话表';

-- 4. 游戏活动表
CREATE TABLE IF NOT EXISTS `game_activities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '活动名称',
  `type` varchar(50) NOT NULL COMMENT '活动类型',
  `description` varchar(500) DEFAULT NULL COMMENT '活动描述',
  `start_time` timestamp NULL DEFAULT NULL COMMENT '开始时间',
  `end_time` timestamp NULL DEFAULT NULL COMMENT '结束时间',
  `config` text COMMENT '活动配置(JSON格式)',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏活动表';

-- 5. 活动参与表
CREATE TABLE IF NOT EXISTS `activity_participants` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `activity_id` bigint(20) unsigned NOT NULL COMMENT '活动ID',
  `player_id` bigint(20) unsigned NOT NULL COMMENT '玩家ID',
  `score` int(11) NOT NULL DEFAULT '0' COMMENT '活动得分',
  `rank` int(11) NOT NULL DEFAULT '0' COMMENT '活动排名',
  `reward` text COMMENT '奖励信息(JSON格式)',
  `participated_at` timestamp NULL DEFAULT NULL COMMENT '参与时间',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_activity_player` (`activity_id`, `player_id`),
  KEY `idx_activity_id` (`activity_id`),
  KEY `idx_player_id` (`player_id`),
  KEY `idx_score` (`score`),
  KEY `idx_rank` (`rank`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动参与表';