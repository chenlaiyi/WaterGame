#!/bin/bash

# 游戏管理Vue组件部署脚本
# 将本地Vue组件文件部署到服务器管理后台

echo "开始部署游戏管理Vue组件到服务器..."

# 服务器配置
SERVER_HOST="139.9.61.199"
SERVER_USER="root"
ADMIN_PATH="/www/wwwroot/pay.itapgo.com/Tapp/admin"

# 本地文件路径
LOCAL_GAME_CONFIG="./GameConfig.vue"
LOCAL_GAME_ANALYTICS="./GameAnalytics.vue"
LOCAL_GAME_ACTIVITY="./GameActivity.vue"

# 检查本地文件是否存在
echo "检查本地Vue组件文件..."
for file in "$LOCAL_GAME_CONFIG" "$LOCAL_GAME_ANALYTICS" "$LOCAL_GAME_ACTIVITY"; do
    if [ ! -f "$file" ]; then
        echo "错误：文件不存在 - $file"
        exit 1
    fi
    echo "✓ 找到文件: $file"
done

echo "所有Vue组件文件检查完毕！"

# 创建服务器目录（如果不存在）
echo "在服务器上创建必要的目录..."
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    # 确定管理后台的前端资源路径
    ADMIN_PATH="/www/wwwroot/pay.itapgo.com/Tapp/admin"
    
    # 查找可能的Vue组件存放路径
    if [ -d "$ADMIN_PATH/resources/js/components" ]; then
        VUE_PATH="$ADMIN_PATH/resources/js/components"
    elif [ -d "$ADMIN_PATH/resources/assets/js/components" ]; then
        VUE_PATH="$ADMIN_PATH/resources/assets/js/components"
    elif [ -d "$ADMIN_PATH/public/js/components" ]; then
        VUE_PATH="$ADMIN_PATH/public/js/components"
    elif [ -d "$ADMIN_PATH/static/js/components" ]; then
        VUE_PATH="$ADMIN_PATH/static/js/components"
    else
        # 如果都不存在，创建标准Laravel结构
        VUE_PATH="$ADMIN_PATH/resources/js/components"
        mkdir -p "$VUE_PATH"
        echo "创建Vue组件目录: $VUE_PATH"
    fi
    
    # 创建游戏管理组件子目录
    mkdir -p "$VUE_PATH/Game"
    
    echo "Vue组件目录准备完成: $VUE_PATH/Game"
    echo "$VUE_PATH" > /tmp/vue_path
EOF

echo "🎉 Vue组件部署完成！"
echo "现在您可以按照以下顺序执行：1. 执行数据库脚本 2. 运行部署脚本 3. 按照指导文档完成剩余配置"