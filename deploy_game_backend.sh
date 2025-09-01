#!/bin/bash

# 游戏后端部署脚本
# 将Laravel控制器和API路由部署到服务器

echo "开始部署游戏后端到服务器..."

# 服务器配置
SERVER_HOST="139.9.61.199"
SERVER_USER="root"
LARAVEL_PATH="/www/wwwroot/pay.itapgo.com/Tapp/admin"

# 本地文件
LOCAL_GAME_CONFIG_CONTROLLER="./GameConfigController.php"
LOCAL_GAME_ANALYTICS_CONTROLLER="./GameAnalyticsController.php"
LOCAL_GAME_ACTIVITY_CONTROLLER="./GameActivityController.php"
LOCAL_API_ROUTES="./game_api_routes.php"

# 检查文件是否存在
echo "检查本地文件..."
for file in "$LOCAL_GAME_CONFIG_CONTROLLER" "$LOCAL_GAME_ANALYTICS_CONTROLLER" "$LOCAL_GAME_ACTIVITY_CONTROLLER" "$LOCAL_API_ROUTES"; do
    if [ ! -f "$file" ]; then
        echo "错误：文件不存在 - $file"
        exit 1
    fi
    echo "✓ 找到文件: $file"
done

# 在服务器上创建必要的目录
echo "在服务器上创建目录..."
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    LARAVEL_PATH="/www/wwwroot/pay.itapgo.com/Tapp/admin"
    
    # 创建控制器目录
    mkdir -p "$LARAVEL_PATH/app/Http/Controllers/Game/Api/V1"
    
    # 创建路由目录
    mkdir -p "$LARAVEL_PATH/routes"
    
    echo "目录创建完成"
EOF

# 上传控制器文件
echo "上传控制器文件..."

echo "上传GameConfigController.php..."
scp "$LOCAL_GAME_CONFIG_CONTROLLER" "$SERVER_USER@$SERVER_HOST:$LARAVEL_PATH/app/Http/Controllers/Game/Api/V1/"
if [ $? -eq 0 ]; then
    echo "✓ GameConfigController.php 上传成功"
else
    echo "❌ GameConfigController.php 上传失败"
    exit 1
fi

echo "上传GameAnalyticsController.php..."
scp "$LOCAL_GAME_ANALYTICS_CONTROLLER" "$SERVER_USER@$SERVER_HOST:$LARAVEL_PATH/app/Http/Controllers/Game/Api/V1/"
if [ $? -eq 0 ]; then
    echo "✓ GameAnalyticsController.php 上传成功"
else
    echo "❌ GameAnalyticsController.php 上传失败"
    exit 1
fi

echo "上传GameActivityController.php..."
scp "$LOCAL_GAME_ACTIVITY_CONTROLLER" "$SERVER_USER@$SERVER_HOST:$LARAVEL_PATH/app/Http/Controllers/Game/Api/V1/"
if [ $? -eq 0 ]; then
    echo "✓ GameActivityController.php 上传成功"
else
    echo "❌ GameActivityController.php 上传失败"
    exit 1
fi

# 上传API路由文件
echo "上传API路由文件..."
scp "$LOCAL_API_ROUTES" "$SERVER_USER@$SERVER_HOST:$LARAVEL_PATH/routes/"
if [ $? -eq 0 ]; then
    echo "✓ game_api_routes.php 上传成功"
else
    echo "❌ game_api_routes.php 上传失败"
    exit 1
fi

# 验证上传结果
echo "验证上传结果..."
ssh $SERVER_USER@$SERVER_HOST << EOF
    echo "检查上传的文件:"
    ls -la $LARAVEL_PATH/app/Http/Controllers/Game/Api/V1/
    echo ""
    ls -la $LARAVEL_PATH/routes/game_api_routes.php
EOF

echo ""
echo "🎉 后端部署完成！"
echo ""
echo "部署总结:"
echo "✓ GameConfigController.php (游戏配置管理)"
echo "✓ GameAnalyticsController.php (游戏数据分析)"
echo "✓ GameActivityController.php (游戏活动管理)"
echo "✓ game_api_routes.php (API路由配置)"
echo ""
echo "接下来需要:"
echo "1. 在 routes/api.php 中引入 game_api_routes.php"
echo "2. 运行数据库迁移创建表结构"
echo "3. 配置相关中间件和权限"
echo "4. 测试API接口功能"