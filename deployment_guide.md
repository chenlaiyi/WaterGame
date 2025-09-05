# WaterGame项目部署指南

## 概述

本文档详细说明了如何部署WaterGame项目的各个组件，包括微信小游戏前端、Laravel后端API和Vue管理后台。

## 部署环境要求

### 前端环境
- 微信开发者工具 1.05.0+
- Node.js 14.0+
- 微信小程序/小游戏开发权限

### 后端环境
- PHP 7.4+
- Laravel 8.0+
- MySQL 5.7+
- Redis (可选，用于缓存)
- Nginx 或 Apache

## 部署步骤

### 1. 微信小游戏前端部署

#### 1.1 项目初始化
```bash
# 克隆项目代码
git clone https://github.com/chenlaiyi/WaterGame.git
cd WaterGame
```

#### 1.2 配置云开发
1. 在微信开发者工具中打开项目
2. 开通云开发环境
3. 修改 `app.js` 中的云开发环境ID
4. 部署云函数 `userLogin`

#### 1.3 配置广告位
1. 在微信公众平台申请激励视频广告位
2. 替换代码中的广告位ID

#### 1.4 上传发布
1. 在微信开发者工具中上传代码
2. 提交审核发布

### 2. Laravel后端API部署

#### 2.1 服务器环境配置
```bash
# 安装PHP依赖
composer install

# 复制环境配置文件
cp .env.example .env

# 生成应用密钥
php artisan key:generate
```

#### 2.2 数据库配置
1. 创建数据库
2. 修改 `.env` 文件中的数据库配置
3. 运行数据库迁移
```bash
php artisan migrate
```

#### 2.3 部署API控制器
```bash
# 运行后端部署脚本
chmod +x deploy_game_backend.sh
./deploy_game_backend.sh
```

#### 2.4 配置API路由
在 `routes/api.php` 中添加：
```php
// 游戏管理API路由
require __DIR__.'/game_api_routes.php';
```

#### 2.5 配置Web服务器
Nginx配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/project/public;
    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 3. Vue管理后台部署

#### 3.1 部署Vue组件
```bash
# 运行Vue组件部署脚本
chmod +x deploy_vue_components.sh
./deploy_vue_components.sh
```

#### 3.2 配置前端路由
在管理后台的路由配置文件中添加：
```javascript
// 游戏管理路由
{
  path: '/admin/game/config',
  name: 'GameConfig',
  component: () => import('@/components/Game/GameConfig.vue'),
  meta: { 
    title: '游戏配置',
    requiresAuth: true 
  }
},
{
  path: '/admin/game/analytics', 
  name: 'GameAnalytics',
  component: () => import('@/components/Game/GameAnalytics.vue'),
  meta: { 
    title: '游戏数据分析',
    requiresAuth: true 
  }
},
{
  path: '/admin/game/activity',
  name: 'GameActivity', 
  component: () => import('@/components/Game/GameActivity.vue'),
  meta: { 
    title: '游戏活动管理',
    requiresAuth: true 
  }
}
```

#### 3.3 配置Laravel Web路由
在 `routes/web.php` 中添加：
```php
Route::prefix('admin')->middleware(['auth:admin'])->group(function () {
    // 游戏管理页面路由
    Route::get('game/config', function () {
        return view('admin.index');
    })->name('admin.game.config');
    
    Route::get('game/analytics', function () {
        return view('admin.index');
    })->name('admin.game.analytics');
    
    Route::get('game/activity', function () {
        return view('admin.index');
    })->name('admin.game.activity');
});
```

## 数据库表结构

运行以下SQL脚本创建数据库表：
```sql
source create_game_tables.sql
```

## 环境变量配置

### Laravel .env配置
```env
# 数据库配置
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# 微信配置
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret

# 云开发配置
CLOUD_ENV_ID=your_cloud_env_id
```

## 常见问题解决

### 1. API接口404错误
- 检查路由是否正确注册
- 确认控制器文件已部署到正确位置
- 清除路由缓存：`php artisan route:clear`

### 2. 数据库连接错误
- 检查数据库配置是否正确
- 确认数据库服务是否运行
- 检查数据库用户权限

### 3. Vue组件加载失败
- 检查Vue组件是否正确部署
- 确认前端路由配置是否正确
- 检查Webpack构建是否成功

## 性能优化建议

### 1. 数据库优化
- 为常用查询字段添加索引
- 使用数据库连接池
- 定期优化表结构

### 2. 缓存优化
- 使用Redis缓存热点数据
- 缓存游戏配置信息
- 实现API响应缓存

### 3. 前端优化
- 启用Gzip压缩
- 使用CDN加速静态资源
- 实现资源懒加载

## 监控和日志

### 1. Laravel日志
- 日志文件位置：`storage/logs/laravel.log`
- 配置日志级别：`.env` 文件中的 `LOG_LEVEL`

### 2. API监控
- 使用Laravel Telescope监控API请求
- 配置APM工具如NewRelic或DataDog

### 3. 数据库监控
- 监控慢查询日志
- 使用数据库性能分析工具

## 安全配置

### 1. API安全
- 使用HTTPS加密传输
- 实现API限流
- 验证请求来源

### 2. 数据库安全
- 使用参数化查询防止SQL注入
- 定期备份数据库
- 限制数据库用户权限

### 3. 应用安全
- 定期更新依赖包
- 实施CSRF保护
- 验证用户输入

## 备份和恢复

### 1. 代码备份
```bash
# 创建代码备份
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin --tags
```

### 2. 数据库备份
```bash
# 创建数据库备份
mysqldump -u username -p database_name > backup.sql
```

### 3. 配置文件备份
```bash
# 备份环境配置
cp .env .env.backup
```

## 版本升级

### 1. 获取最新代码
```bash
git pull origin main
```

### 2. 更新依赖
```bash
# 更新PHP依赖
composer update

# 更新Node.js依赖（如果有的话）
npm update
```

### 3. 数据库迁移
```bash
php artisan migrate
```

### 4. 清除缓存
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## 联系支持

如有部署问题，请联系：
- 技术支持：chenlaiyi@tapgo.cn
- 商务合作：business@tapgo.cn