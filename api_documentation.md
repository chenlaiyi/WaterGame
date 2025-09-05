# WaterGame API文档

## 概述

本文档详细描述了WaterGame项目的API接口，包括游戏配置管理、数据分析和活动管理等功能。所有API都遵循RESTful设计原则，使用JSON格式进行数据交换。

## 基础信息

### Base URL
```
https://your-domain.com/api/game/v1
```

### 认证方式
所有API都需要通过JWT Token进行认证，请求头中需要包含：
```
Authorization: Bearer {token}
```

### 响应格式
所有API响应都采用统一的JSON格式：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 状态码
| 状态码 | 说明 |
|-------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 游戏配置管理API

### 1. 获取游戏配置列表

**接口地址**: `GET /config`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| search | string | 否 | 搜索关键词 |
| status | integer | 否 | 状态筛选(0:禁用,1:启用) |
| type | string | 否 | 类型筛选(string,integer,float,boolean,json) |
| sort_by | string | 否 | 排序字段，默认:id |
| sort_order | string | 否 | 排序方式(asc,desc)，默认:desc |
| per_page | integer | 否 | 每页数量，默认:15 |

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "config_key": "game.max_level",
        "config_name": "最大关卡数",
        "config_value": "30",
        "config_type": "integer",
        "description": "游戏最大关卡数量",
        "status": 1,
        "created_at": "2023-01-01 12:00:00",
        "updated_at": "2023-01-01 12:00:00"
      }
    ],
    "first_page_url": "https://your-domain.com/api/game/v1/config?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "https://your-domain.com/api/game/v1/config?page=1",
    "next_page_url": null,
    "path": "https://your-domain.com/api/game/v1/config",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

### 2. 创建游戏配置

**接口地址**: `POST /config`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| config_key | string | 是 | 配置键名 |
| config_name | string | 是 | 配置名称 |
| config_value | string | 是 | 配置值 |
| config_type | string | 是 | 配置类型(string,integer,float,boolean,json) |
| description | string | 否 | 配置描述 |
| status | integer | 是 | 状态(0:禁用,1:启用) |

**响应示例**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1
  }
}
```

### 3. 更新游戏配置

**接口地址**: `PUT /config/{id}`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| config_key | string | 是 | 配置键名 |
| config_name | string | 是 | 配置名称 |
| config_value | string | 是 | 配置值 |
| config_type | string | 是 | 配置类型(string,integer,float,boolean,json) |
| description | string | 否 | 配置描述 |
| status | integer | 是 | 状态(0:禁用,1:启用) |

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

### 4. 删除游戏配置

**接口地址**: `DELETE /config/{id}`

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

## 游戏数据分析API

### 1. 获取游戏数据仪表板

**接口地址**: `GET /analytics/dashboard`

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalPlayers": 1234,
    "totalSessions": 5678,
    "avgScore": 123.45,
    "avgDuration": 180.5,
    "dailyStats": [
      {
        "date": "2023-01-01",
        "sessions": 123,
        "players": 45
      }
    ]
  }
}
```

### 2. 获取玩家列表

**接口地址**: `GET /analytics/players`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| search | string | 否 | 搜索关键词 |
| sort_by | string | 否 | 排序字段，默认:id |
| sort_order | string | 否 | 排序方式(asc,desc)，默认:desc |
| per_page | integer | 否 | 每页数量，默认:15 |

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "openid": "o123456789",
        "nickname": "玩家昵称",
        "avatar": "https://example.com/avatar.jpg",
        "best_score": 1000,
        "total_games": 50,
        "total_playtime": 3600,
        "last_played_at": "2023-01-01 12:00:00",
        "created_at": "2023-01-01 12:00:00",
        "updated_at": "2023-01-01 12:00:00"
      }
    ],
    "first_page_url": "https://your-domain.com/api/game/v1/analytics/players?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "https://your-domain.com/api/game/v1/analytics/players?page=1",
    "next_page_url": null,
    "path": "https://your-domain.com/api/game/v1/analytics/players",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

### 3. 获取玩家游戏会话记录

**接口地址**: `GET /analytics/players/{id}/sessions`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| sort_by | string | 否 | 排序字段，默认:created_at |
| sort_order | string | 否 | 排序方式(asc,desc)，默认:desc |
| per_page | integer | 否 | 每页数量，默认:15 |

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "player_id": 1,
        "level": 5,
        "score": 500,
        "duration": 120,
        "status": 2,
        "start_time": "2023-01-01 12:00:00",
        "end_time": "2023-01-01 12:02:00",
        "created_at": "2023-01-01 12:00:00",
        "updated_at": "2023-01-01 12:00:00"
      }
    ],
    "first_page_url": "https://your-domain.com/api/game/v1/analytics/players/1/sessions?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "https://your-domain.com/api/game/v1/analytics/players/1/sessions?page=1",
    "next_page_url": null,
    "path": "https://your-domain.com/api/game/v1/analytics/players/1/sessions",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

### 4. 获取所有游戏会话记录

**接口地址**: `GET /analytics/sessions`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| search | string | 否 | 搜索关键词 |
| level | integer | 否 | 关卡筛选 |
| status | integer | 否 | 状态筛选(1:进行中,2:完成,3:失败) |
| sort_by | string | 否 | 排序字段，默认:game_sessions.created_at |
| sort_order | string | 否 | 排序方式(asc,desc)，默认:desc |
| per_page | integer | 否 | 每页数量，默认:15 |

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "player_id": 1,
        "level": 5,
        "score": 500,
        "duration": 120,
        "status": 2,
        "start_time": "2023-01-01 12:00:00",
        "end_time": "2023-01-01 12:02:00",
        "created_at": "2023-01-01 12:00:00",
        "updated_at": "2023-01-01 12:00:00",
        "player_nickname": "玩家昵称",
        "player_openid": "o123456789"
      }
    ],
    "first_page_url": "https://your-domain.com/api/game/v1/analytics/sessions?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "https://your-domain.com/api/game/v1/analytics/sessions?page=1",
    "next_page_url": null,
    "path": "https://your-domain.com/api/game/v1/analytics/sessions",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

### 5. 获取性能统计数据

**接口地址**: `GET /analytics/performance`

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "level_completion": [
      {
        "level": 1,
        "total_attempts": 100,
        "completed": 80,
        "completion_rate": 80.00
      }
    ],
    "duration_distribution": [
      {
        "duration_range": "1-3分钟",
        "count": 50
      }
    ]
  }
}
```

## 游戏活动管理API

### 1. 获取游戏活动列表

**接口地址**: `GET /activity`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| search | string | 否 | 搜索关键词 |
| status | integer | 否 | 状态筛选(0:禁用,1:启用) |
| type | string | 否 | 类型筛选 |
| sort_by | string | 否 | 排序字段，默认:created_at |
| sort_order | string | 否 | 排序方式(asc,desc)，默认:desc |
| per_page | integer | 否 | 每页数量，默认:15 |

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "春节活动",
        "type": "seasonal_event",
        "description": "春节特别活动",
        "start_time": "2023-01-20 00:00:00",
        "end_time": "2023-02-05 23:59:59",
        "config": "{\"reward_multiplier\": 2}",
        "status": 1,
        "created_at": "2023-01-01 12:00:00",
        "updated_at": "2023-01-01 12:00:00"
      }
    ],
    "first_page_url": "https://your-domain.com/api/game/v1/activity?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "https://your-domain.com/api/game/v1/activity?page=1",
    "next_page_url": null,
    "path": "https://your-domain.com/api/game/v1/activity",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

### 2. 创建游戏活动

**接口地址**: `POST /activity`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| name | string | 是 | 活动名称 |
| type | string | 是 | 活动类型 |
| description | string | 否 | 活动描述 |
| start_time | datetime | 是 | 开始时间 |
| end_time | datetime | 是 | 结束时间 |
| config | string | 否 | 活动配置(JSON格式) |
| status | integer | 是 | 状态(0:禁用,1:启用) |

**响应示例**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1
  }
}
```

### 3. 更新游戏活动

**接口地址**: `PUT /activity/{id}`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| name | string | 是 | 活动名称 |
| type | string | 是 | 活动类型 |
| description | string | 否 | 活动描述 |
| start_time | datetime | 是 | 开始时间 |
| end_time | datetime | 是 | 结束时间 |
| config | string | 否 | 活动配置(JSON格式) |
| status | integer | 是 | 状态(0:禁用,1:启用) |

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

### 4. 删除游戏活动

**接口地址**: `DELETE /activity/{id}`

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 5. 切换活动状态

**接口地址**: `POST /activity/{id}/toggle-status`

**响应示例**:
```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "status": 1
  }
}
```

### 6. 获取活动参与者列表

**接口地址**: `GET /activity/{id}/participants`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| sort_by | string | 否 | 排序字段，默认:rank |
| sort_order | string | 否 | 排序方式(asc,desc)，默认:asc |
| per_page | integer | 否 | 每页数量，默认:15 |

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "activity_id": 1,
        "player_id": 1,
        "score": 1000,
        "rank": 1,
        "reward": "{\"coins\": 100}",
        "participated_at": "2023-01-01 12:00:00",
        "created_at": "2023-01-01 12:00:00",
        "updated_at": "2023-01-01 12:00:00",
        "nickname": "玩家昵称",
        "avatar": "https://example.com/avatar.jpg",
        "openid": "o123456789"
      }
    ],
    "first_page_url": "https://your-domain.com/api/game/v1/activity/1/participants?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "https://your-domain.com/api/game/v1/activity/1/participants?page=1",
    "next_page_url": null,
    "path": "https://your-domain.com/api/game/v1/activity/1/participants",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

### 7. 获取活动统计信息

**接口地址**: `GET /activity/{id}/statistics`

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "participant_count": 100,
    "max_score": 2000,
    "avg_score": 1200.50
  }
}
```

### 8. 导出活动数据

**接口地址**: `GET /activity/{id}/export`

**响应示例**:
```json
{
  "code": 200,
  "message": "导出成功",
  "data": [
    {
      "nickname": "玩家昵称",
      "openid": "o123456789",
      "score": 1000,
      "rank": 1,
      "participated_at": "2023-01-01 12:00:00"
    }
  ]
}
```

## 错误响应格式

所有错误响应都遵循以下格式：
```json
{
  "code": 500,
  "message": "错误描述信息",
  "data": null
}
```

对于参数验证错误，data字段会包含具体的错误信息：
```json
{
  "code": 400,
  "message": "参数验证失败",
  "data": {
    "config_key": [
      "配置键名不能为空"
    ]
  }
}
```

## 速率限制

为了保护API免受滥用，所有端点都实施了速率限制：
- 每个IP地址每分钟最多60次请求
- 超过限制的请求将返回429状态码

## 安全措施

API实施了以下安全措施：
- HTTPS加密传输
- JWT Token认证
- 请求频率限制
- 输入验证和过滤
- SQL注入防护
- XSS攻击防护

---

*本文档将持续更新，以反映最新的API接口和功能。*