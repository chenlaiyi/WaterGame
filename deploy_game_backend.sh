#!/bin/bash

# 游戏管理后端部署脚本
# 部署Laravel控制器和相关配置到服务器

echo "开始部署游戏管理后端组件..."

# 服务器配置
SERVER_HOST="139.9.61.199"
SERVER_USER="root"
CONTROLLER_PATH="/www/wwwroot/pay.itapgo.com/Tapp/admin/app/Http/Controllers/Game/Api/V1"
ROUTES_PATH="/www/wwwroot/pay.itapgo.com/Tapp/admin/routes"

# 检查本地文件
echo "检查所需文件..."
required_files=(
    "GameConfigController.php"
    "GameAnalyticsController.php" 
    "GameActivityController.php"
    "game_api_routes.php"
    "create_game_tables.sql"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "错误：文件不存在 - $file"
        exit 1
    fi
    echo "✓ 找到文件: $file"
done

# 创建服务器目录
echo "创建服务器目录..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $CONTROLLER_PATH"

# 上传控制器文件
echo "上传Laravel控制器文件..."
scp GameConfigController.php $SERVER_USER@$SERVER_HOST:$CONTROLLER_PATH/
scp GameAnalyticsController.php $SERVER_USER@$SERVER_HOST:$CONTROLLER_PATH/
scp GameActivityController.php $SERVER_USER@$SERVER_HOST:$CONTROLLER_PATH/

# 上传路由配置
echo "上传API路由配置..."
scp game_api_routes.php $SERVER_USER@$SERVER_HOST:/tmp/

# 上传数据库脚本
echo "上传数据库脚本..."
scp create_game_tables.sql $SERVER_USER@$SERVER_HOST:/tmp/

echo "✅ 所有文件上传完成！"

echo ""
echo "接下来需要手动执行："
echo "1. 执行数据库脚本: mysql -u root -p < /tmp/create_game_tables.sql"
echo "2. 将 /tmp/game_api_routes.php 内容添加到 routes/api.php"
echo "3. 运行: php artisan config:clear && php artisan route:clear"
echo "4. 配置前端路由和编译资源"