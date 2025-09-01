# API配置指南

## 概述

本文档描述了如何为点点够净水消消乐游戏配置API接口，包括服务器端和客户端的配置要求。

## API基础信息

### 基础URL
根据用户反馈，API的URL应该是：
```
https://pay.itapgo.com/api/game/v1/
```

### 请求格式
- **Content-Type**: `application/json`
- **请求方法**: GET, POST, PUT, DELETE
- **响应格式**: JSON

### 通用响应结构
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 状态码说明
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器内部错误

## 游戏配置API

### 1. 获取配置列表

**接口**: `GET /api/game/v1/config`

**参数**:
- `search` (string, optional): 搜索关键词
- `status` (int, optional): 状态筛选 (0:禁用, 1:启用)
- `page` (int, optional): 页码，默认1
- `per_page` (int, optional): 每页数量，默认15

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
        "name": "游戏时间限制",
        "type": "gameplay",
        "value": "300",
        "description": "每局游戏的时间限制（秒）",
        "status": 1,
        "created_at": "2023-12-01 10:00:00",
        "updated_at": "2023-12-01 10:00:00"
      }
    ],
    "total": 1,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1
  }
}
```

### 2. 创建配置

**接口**: `POST /api/game/v1/config`

**请求参数**:
```json
{
  "name": "配置名称",
  "type": "配置类型",
  "value": "配置值",
  "description": "配置描述",
  "status": 1
}
```

**字段说明**:
- `name` (required): 配置名称，最长100字符
- `type` (required): 配置类型，最长50字符
- `value` (required): 配置值
- `description` (optional): 配置描述，最长255字符
- `status` (optional): 状态，默认1

### 3. 获取单个配置

**接口**: `GET /api/game/v1/config/{id}`

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "游戏时间限制",
    "type": "gameplay",
    "value": "300",
    "description": "每局游戏的时间限制（秒）",
    "status": 1,
    "created_at": "2023-12-01 10:00:00",
    "updated_at": "2023-12-01 10:00:00"
  }
}
```

### 4. 更新配置

**接口**: `PUT /api/game/v1/config/{id}`

**请求参数**: 与创建接口相同，但所有字段都是可选的

### 5. 删除配置

**接口**: `DELETE /api/game/v1/config/{id}`

## 游戏数据分析API

### 1. 获取仪表板数据

**接口**: `GET /api/game/v1/analytics/dashboard`

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalPlayers": 1523,
    "totalSessions": 8934,
    "avgScore": 1250.5,
    "avgDuration": 185.2,
    "dailyStats": [
      {
        "date": "2023-12-01",
        "sessions": 156,
        "players": 89
      }
    ]
  }
}
```

### 2. 获取玩家列表

**接口**: `GET /api/game/v1/analytics/players`

**参数**:
- `search` (string, optional): 搜索关键词
- `sort_by` (string, optional): 排序字段
- `page` (int, optional): 页码
- `per_page` (int, optional): 每页数量

### 3. 获取玩家游戏记录

**接口**: `GET /api/game/v1/analytics/players/{id}/sessions`

## 游戏活动管理API

### 1. 获取活动列表

**接口**: `GET /api/game/v1/activity`

**参数**:
- `search` (string, optional): 搜索关键词
- `status` (int, optional): 状态筛选
- `type` (string, optional): 活动类型

### 2. 创建活动

**接口**: `POST /api/game/v1/activity`

**请求参数**:
```json
{
  "name": "活动名称",
  "type": "活动类型",
  "description": "活动描述",
  "config": "{\"目标分数\": 1000}",
  "start_time": "2023-12-01 10:00:00",
  "end_time": "2023-12-31 23:59:59",
  "status": 1,
  "reward_config": "{\"奖励\": 100}"
}
```

## 错误处理

所有API都包含统一的错误处理机制：

```json
{
  "code": 400,
  "message": "参数验证失败：配置名称不能为空",
  "data": null
}
```

## 认证和权限

目前的API接口需要管理员身份认证，请确保在请求头中包含适当的认证信息。

## 测试指南

建议使用Postman或类似工具测试API接口，确保在集成到前端之前所有接口都能正常工作。