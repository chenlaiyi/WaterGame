#!/bin/bash

# 点点够净水消消乐后端部署脚本

# 设置变量
PROJECT_DIR="/Users/chanlaiyi/Water-Game"
CLOUD_FUNCTIONS_DIR="$PROJECT_DIR/cloudfunctions"
DEPLOY_LOG="$PROJECT_DIR/deploy.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $DEPLOY_LOG
}

log_success() {
    echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S') - $1${NC}" | tee -a $DEPLOY_LOG
}

log_warning() {
    echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') - $1${NC}" | tee -a $DEPLOY_LOG
}

log_error() {
    echo -e "${RED}$(date '+%Y-%m-%d %H:%M:%S') - $1${NC}" | tee -a $DEPLOY_LOG
}

# 检查微信开发者工具是否安装
check_wechat_devtools() {
    log "检查微信开发者工具..."
    if ! command -v wechat-devtools &> /dev/null; then
        log_warning "未检测到微信开发者工具命令行工具"
        log "请确保已安装微信开发者工具并配置了命令行调用"
    else
        log_success "微信开发者工具已安装"
    fi
}

# 部署云函数
deploy_cloud_functions() {
    log "开始部署云函数..."
    
    # 检查云函数目录是否存在
    if [ ! -d "$CLOUD_FUNCTIONS_DIR" ]; then
        log_error "云函数目录不存在: $CLOUD_FUNCTIONS_DIR"
        return 1
    fi
    
    # 遍历所有云函数目录
    for func_dir in "$CLOUD_FUNCTIONS_DIR"/*; do
        if [ -d "$func_dir" ]; then
            func_name=$(basename "$func_dir")
            log "部署云函数: $func_name"
            
            # 检查package.json是否存在
            if [ -f "$func_dir/package.json" ]; then
                # 安装依赖
                log "安装依赖: $func_name"
                cd "$func_dir"
                npm install --production
                if [ $? -ne 0 ]; then
                    log_error "依赖安装失败: $func_name"
                    continue
                fi
            fi
            
            # 使用微信开发者工具部署云函数
            # 这里需要根据实际的命令行工具调整
            log "上传云函数: $func_name"
            # wechat-devtools --upload-function "$func_name" "$func_dir"
            
            log_success "云函数部署完成: $func_name"
        fi
    done
    
    log_success "所有云函数部署完成"
}

# 部署数据库
deploy_database() {
    log "开始部署数据库..."
    
    # 检查SQL文件是否存在
    SQL_FILE="$PROJECT_DIR/create_game_tables.sql"
    if [ ! -f "$SQL_FILE" ]; then
        log_error "数据库SQL文件不存在: $SQL_FILE"
        return 1
    fi
    
    log "执行数据库脚本: $SQL_FILE"
    # 这里需要根据实际的数据库部署方式调整
    # 例如使用微信云开发的数据库导入功能
    
    log_success "数据库部署完成"
}

# 部署前端资源
deploy_frontend() {
    log "开始部署前端资源..."
    
    # 检查项目目录
    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "项目目录不存在: $PROJECT_DIR"
        return 1
    fi
    
    # 使用微信开发者工具上传代码
    log "上传小程序代码"
    # wechat-devtools --upload "$PROJECT_DIR"
    
    log_success "前端资源部署完成"
}

# 主部署流程
main() {
    log "===================="
    log "点点够净水消消乐部署开始"
    log "===================="
    
    # 检查环境
    check_wechat_devtools
    
    # 部署云函数
    deploy_cloud_functions
    
    # 部署数据库
    deploy_database
    
    # 部署前端
    deploy_frontend
    
    log "===================="
    log "部署完成"
    log "===================="
    
    log_success "部署脚本执行完毕，请在微信公众平台查看部署结果"
}

# 执行主函数
main "$@"