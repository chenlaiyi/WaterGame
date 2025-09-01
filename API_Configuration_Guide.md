# WaterGame项目 API配置指南

## 概述

本文档描述了WaterGame项目中所有游戏相关的API接口，包括游戏配置管理、数据分析和活动管理等功能。

## API基本信息

- **基础URL**: `/api/game/v1`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **HTTP方法**: GET, POST, PUT, DELETE

## 响应格式

所有API接口的响应都遵循统一格式：

```json
{
  "code": 200,
  "message": "成功",
  "data": {}
}
```

## 1. 游戏配置管理 API

### 1.1 获取配置列表

**请求**
```
GET /api/game/v1/config
```

**参数**
- `search` (string, 可选): 搜索关键词
- `status` (integer, 可选): 状态 (0=禁用, 1=启用)
- `type` (string, 可选): 配置类型
- `sort_by` (string, 可选): 排序字段 (默认: id)
- `sort_order` (string, 可选): 排序方向 (asc/desc, 默认: desc)
- `per_page` (integer, 可选): 每页数量 (默认: 15)

**响应示例**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "config_key": "game_level_count",
        "config_name": "游戏关卡数量",
        "config_value": "10",
        "config_type": "integer",
        "description": "游戏的总关卡数",
        "status": 1,
        "created_at": "2025-08-31T10:00:00.000000Z",
        "updated_at": "2025-08-31T10:00:00.000000Z"
      }
    ],
    "per_page": 15,
    "total": 1
  }
}
```

### 1.2 创建配置

**请求**
```
POST /api/game/v1/config
```

**请求参数**
```json
{
  "config_key": "game_difficulty",
  "config_name": "游戏难度",
  "config_value": "normal",
  "config_type": "string",
  "description": "游戏默认难度设置",
  "status": 1
}
```

### 1.3 更新配置

**请求**
```
PUT /api/game/v1/config/{id}
```

### 1.4 删除配置

**请求**
```
DELETE /api/game/v1/config/{id}
```

## 2. 游戏数据分析 API

### 2.1 获取仪表板数据

**请求**
```
GET /api/game/v1/analytics/dashboard
```

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "totalPlayers": 1256,
    "totalSessions": 8943,
    "avgScore": 2850,
    "avgDuration": 180,
    "dailyStats": [
      {
        "date": "2025-08-31",
        "players": 89,
        "sessions": 234,
        "avgScore": 2920
      }
    ]
  }
}
```

### 2.2 获取玩家列表

**请求**
```
GET /api/game/v1/analytics/players
```

**参数**
- `search` (string, 可选): 搜索玩家昵称或OpenID
- `sort_by` (string, 可选): 排序方式 (best_score/total_games/created_at/last_played_at)
- `page` (integer, 可选): 页码
- `per_page` (integer, 可选): 每页数量

### 2.3 获取玩家游戏记录

**请求**
```
GET /api/game/v1/analytics/players/{id}/sessions
```

## 3. 游戏活动管理 API

### 3.1 获取活动列表

**请求**
```
GET /api/game/v1/activity
```

**参数**
- `search` (string, 可选): 搜索活动名称
- `status` (integer, 可选): 活动状态
- `type` (string, 可选): 活动类型

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "春节消消乐挑战",
        "type": "seasonal_event",
        "description": "春节特别活动",
        "start_time": "2025-02-01 00:00:00",
        "end_time": "2025-02-15 23:59:59",
        "config": "{\"reward_multiplier\": 2}",
        "status": 1,
        "created_at": "2025-08-31T10:00:00.000000Z"
      }
    ],
    "total": 1
  }
}
```

### 3.2 创建活动

**请求**
```
POST /api/game/v1/activity
```

**请求参数**
```json
{
  "name": "夏日消消乐大赛",
  "type": "weekly_tournament",
  "description": "夏日特别比赛活动",
  "start_time": "2025-06-01 00:00:00",
  "end_time": "2025-06-30 23:59:59",
  "config": "{\"max_participants\": 1000}",
  "status": 1
}
```

### 3.3 切换活动状态

**请求**
```
POST /api/game/v1/activity/{id}/toggle-status
```

### 3.4 获取活动参与者

**请求**
```
GET /api/game/v1/activity/{id}/participants
```

### 3.5 获取活动统计

**请求**
```
GET /api/game/v1/activity/{id}/statistics
```

## 错误码说明

- `200`: 成功
- `400`: 参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器内部错误

## 注意事项

1. 所有API都需要适当的身份验证
2. 请求和响应数据都使用UTF-8编码
3. 日期时间格式为: YYYY-MM-DD HH:mm:ss
4. 分页查询默认每页显示15条记录
5. 所有删除操作都是物理删除，请谨慎操作