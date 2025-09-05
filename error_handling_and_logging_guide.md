# WaterGame错误处理和日志记录指南

## 概述

本文档详细说明了WaterGame项目中实现的错误处理和日志记录机制，旨在提高系统的稳定性和可维护性，便于问题诊断和系统监控。

## 错误处理机制

### 1. 后端API错误处理

#### 统一错误响应格式
所有API接口都采用统一的错误响应格式：
```json
{
  "code": 500,
  "message": "错误描述信息",
  "data": null
}
```

#### 错误分类
1. **400系列错误**：客户端错误
   - 400：参数验证失败
   - 404：资源不存在

2. **500系列错误**：服务器错误
   - 500：系统内部错误

#### 错误处理实现
```php
try {
    // 业务逻辑
} catch (\Exception $e) {
    // 记录错误日志
    Log::error('获取失败：' . $e->getMessage(), [
        'exception' => $e,
        'request' => $request->all()
    ]);
    
    // 返回统一错误响应
    return response()->json([
        'code' => 500,
        'message' => '获取失败：' . $e->getMessage(),
        'data' => null
    ]);
}
```

### 2. 前端Vue组件错误处理

#### 异步操作错误处理
```javascript
try {
  const response = await this.$http.get('/api/game/v1/config')
  if (response.data.code === 200) {
    // 处理成功响应
  } else {
    // 处理业务错误
    this.$message.error('加载配置列表失败：' + response.data.message)
  }
} catch (error) {
  // 处理网络错误
  this.$message.error('加载配置列表失败：' + error.message)
}
```

#### 用户操作错误处理
```javascript
this.$confirm('确定要删除该配置吗？', '提示', {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  type: 'warning'
}).then(async () => {
  try {
    // 执行删除操作
  } catch (error) {
    // 处理删除失败
    this.$message.error('删除失败：' + error.message)
  }
}).catch(() => {
  // 用户取消操作
})
```

## 日志记录机制

### 1. 日志记录工具类

#### Logger.js
项目实现了统一的日志记录工具类，提供以下功能：
- 多级别日志记录（debug, info, warn, error）
- 本地存储日志
- 错误上报到服务器
- 日志级别控制

#### 使用方法
```javascript
const logger = require('./Logger.js');

// 记录调试日志
logger.debug('调试信息', { data: '附加数据' });

// 记录信息日志
logger.info('一般信息');

// 记录警告日志
logger.warn('警告信息');

// 记录错误日志
logger.error('错误信息', error, { additionalData: '附加数据' });
```

### 2. 日志级别控制

#### 开发环境
- 默认日志级别：debug
- 记录所有级别的日志
- 便于开发调试

#### 生产环境
- 默认日志级别：warn
- 只记录警告和错误日志
- 减少日志对性能的影响

### 3. 日志存储

#### 本地存储
- 使用微信小程序的本地存储功能
- 保留最近100条日志
- 自动清理过期日志

#### 服务器上报
- 在生产环境中自动上报错误日志
- 包含详细的错误信息和上下文数据
- 便于问题追踪和分析

## 错误处理最佳实践

### 1. 前端错误处理

#### 网络请求错误处理
```javascript
async loadConfigs() {
  this.loading = true
  try {
    const response = await this.$http.get('/api/game/v1/config')
    if (response.data.code === 200) {
      this.configList = response.data.data.data
      this.pagination.total = response.data.data.total
    } else {
      // 处理业务错误
      this.$message.error('加载配置列表失败：' + response.data.message)
    }
  } catch (error) {
    // 处理网络错误
    this.$message.error('网络请求失败：' + error.message)
    // 记录错误日志
    logger.error('Failed to load configs', error);
  } finally {
    this.loading = false
  }
}
```

#### 用户操作错误处理
```javascript
async handleStatusChange(row) {
  try {
    const response = await this.$http.put(`/api/game/v1/config/${row.id}`, {
      ...row
    })
    if (response.data.code === 200) {
      this.$message.success('状态更新成功')
    } else {
      this.$message.error('状态更新失败：' + response.data.message)
      // 恢复原来的状态
      row.status = row.status === 1 ? 0 : 1
    }
  } catch (error) {
    this.$message.error('状态更新失败：' + error.message)
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1
    // 记录错误日志
    logger.error('Failed to update config status', error, { row });
  }
}
```

### 2. 后端错误处理

#### 数据库操作错误处理
```php
try {
    $configId = DB::table('game_configs')->insertGetId([
        'config_key' => $request->config_key,
        // 其他字段
    ]);
    
    return response()->json([
        'code' => 200,
        'message' => '创建成功',
        'data' => ['id' => $configId]
    ]);
} catch (\Exception $e) {
    // 记录详细错误日志
    Log::error('创建配置失败', [
        'exception' => $e,
        'request_data' => $request->all(),
        'user_id' => Auth::id()
    ]);
    
    return response()->json([
        'code' => 500,
        'message' => '创建失败：' . $e->getMessage(),
        'data' => null
    ]);
}
```

#### 参数验证错误处理
```php
$validator = Validator::make($request->all(), [
    'config_key' => 'required|string|unique:game_configs',
    // 其他验证规则
]);

if ($validator->fails()) {
    // 记录验证失败日志
    Log::warning('参数验证失败', [
        'errors' => $validator->errors(),
        'request_data' => $request->all()
    ]);
    
    return response()->json([
        'code' => 400,
        'message' => '参数验证失败',
        'data' => $validator->errors()
    ]);
}
```

## 监控和告警

### 1. 错误监控
- 实时监控错误日志
- 统计错误频率和类型
- 识别重复错误和模式

### 2. 性能监控
- 监控API响应时间
- 跟踪慢查询
- 识别性能瓶颈

### 3. 告警机制
- 设置错误阈值告警
- 关键业务指标监控
- 实时通知机制

## 日志分析

### 1. 日志聚合
- 按时间、类型、模块聚合日志
- 生成统计报表
- 识别常见问题模式

### 2. 错误追踪
- 关联相关日志条目
- 还原错误发生场景
- 提供问题解决建议

## 实施建议

### 1. 开发阶段
- 启用详细日志记录
- 全面测试错误处理逻辑
- 验证日志记录准确性

### 2. 测试阶段
- 模拟各种错误场景
- 验证错误恢复机制
- 检查日志完整性

### 3. 生产环境
- 控制日志级别避免性能影响
- 定期清理过期日志
- 监控错误趋势和模式

---

*本文档将持续更新，以反映最新的错误处理和日志记录实践。*