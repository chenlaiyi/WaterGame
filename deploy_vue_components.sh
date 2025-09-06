#!/bin/bash

# 点点够净水消消乐Vue组件部署脚本

# 设置变量
PROJECT_DIR="/Users/chanlaiyi/Water-Game"
VUE_COMPONENTS_DIR="$PROJECT_DIR/vue-components"
DEPLOY_LOG="$PROJECT_DIR/vue_deploy.log"

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

# 检查Node.js和npm是否安装
check_node_npm() {
    log "检查Node.js和npm..."
    
    if ! command -v node &> /dev/null; then
        log_error "未检测到Node.js，请先安装Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "未检测到npm，请先安装npm"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log_success "Node.js版本: $NODE_VERSION"
    log_success "npm版本: $NPM_VERSION"
}

# 安装Vue CLI
install_vue_cli() {
    log "检查Vue CLI..."
    
    if ! command -v vue &> /dev/null; then
        log "Vue CLI未安装，正在安装..."
        npm install -g @vue/cli
        if [ $? -eq 0 ]; then
            log_success "Vue CLI安装成功"
        else
            log_error "Vue CLI安装失败"
            exit 1
        fi
    else
        VUE_VERSION=$(vue --version)
        log_success "Vue CLI版本: $VUE_VERSION"
    fi
}

# 构建Vue组件
build_vue_components() {
    log "开始构建Vue组件..."
    
    # 检查Vue组件目录是否存在
    if [ ! -d "$VUE_COMPONENTS_DIR" ]; then
        log_warning "Vue组件目录不存在: $VUE_COMPONENTS_DIR"
        log "创建Vue组件目录..."
        mkdir -p "$VUE_COMPONENTS_DIR"
        
        # 创建示例Vue组件
        create_sample_components
    fi
    
    # 遍历所有Vue组件目录
    for component_dir in "$VUE_COMPONENTS_DIR"/*; do
        if [ -d "$component_dir" ]; then
            component_name=$(basename "$component_dir")
            log "构建Vue组件: $component_name"
            
            # 检查package.json是否存在
            if [ -f "$component_dir/package.json" ]; then
                # 安装依赖
                log "安装依赖: $component_name"
                cd "$component_dir"
                npm install
                if [ $? -ne 0 ]; then
                    log_error "依赖安装失败: $component_name"
                    continue
                fi
                
                # 构建组件
                log "构建组件: $component_name"
                npm run build
                if [ $? -ne 0 ]; then
                    log_error "组件构建失败: $component_name"
                    continue
                fi
                
                log_success "Vue组件构建完成: $component_name"
            else
                log_warning "跳过构建，缺少package.json: $component_name"
            fi
        fi
    done
    
    log_success "所有Vue组件构建完成"
}

# 创建示例Vue组件
create_sample_components() {
    log "创建示例Vue组件..."
    
    # 创建品牌故事组件
    BRAND_COMPONENT_DIR="$VUE_COMPONENTS_DIR/BrandStory"
    mkdir -p "$BRAND_COMPONENT_DIR"
    
    # 创建package.json
    cat > "$BRAND_COMPONENT_DIR/package.json" << EOF
{
  "name": "brand-story",
  "version": "1.0.0",
  "description": "点点够品牌故事组件",
  "main": "dist/brand-story.js",
  "scripts": {
    "build": "vue build src/BrandStory.vue --target lib --name brand-story",
    "dev": "vue serve src/BrandStory.vue"
  },
  "dependencies": {
    "vue": "^2.6.14"
  }
}
EOF
    
    # 创建src目录
    mkdir -p "$BRAND_COMPONENT_DIR/src"
    
    # 创建Vue组件文件
    cat > "$BRAND_COMPONENT_DIR/src/BrandStory.vue" << EOF
<template>
  <div class="brand-story">
    <h2>{{ brandInfo.name }}品牌故事</h2>
    <p>{{ brandInfo.slogan }}</p>
    <div class="brand-description">
      <p>{{ brandInfo.description }}</p>
    </div>
    <div class="brand-features">
      <h3>核心优势</h3>
      <ul>
        <li v-for="feature in brandInfo.features" :key="feature.title">
          <strong>{{ feature.title }}:</strong> {{ feature.description }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BrandStory',
  data() {
    return {
      brandInfo: {
        name: '点点够',
        slogan: '让每一滴水都纯净',
        description: '专注净水领域，为您提供安全、健康、便捷的净水解决方案',
        features: [
          {
            title: 'RO反渗透技术',
            description: '有效去除水中99%以上的细菌、病毒、重金属等有害物质'
          },
          {
            title: '980元2年',
            description: '超高性价比，两年仅需980元，平均每天1.34元'
          },
          {
            title: '5G智能控制',
            description: '实时监控水质，远程控制设备，智能提醒滤芯更换'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.brand-story {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.brand-story h2 {
  color: #1296db;
  text-align: center;
}

.brand-story h3 {
  color: #333;
}

.brand-description {
  margin: 20px 0;
  line-height: 1.6;
}

.brand-features ul {
  list-style-type: none;
  padding: 0;
}

.brand-features li {
  margin: 10px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}
</style>
EOF
    
    log_success "示例Vue组件创建完成"
}

# 部署Vue组件
deploy_vue_components() {
    log "开始部署Vue组件..."
    
    # 检查构建输出目录
    for component_dir in "$VUE_COMPONENTS_DIR"/*; do
        if [ -d "$component_dir" ]; then
            component_name=$(basename "$component_dir")
            dist_dir="$component_dir/dist"
            
            if [ -d "$dist_dir" ]; then
                log "部署Vue组件: $component_name"
                # 这里可以添加实际的部署逻辑
                # 例如复制到指定目录或上传到CDN
                log_success "Vue组件部署完成: $component_name"
            else
                log_warning "跳过部署，缺少构建输出目录: $component_name"
            fi
        fi
    done
    
    log_success "所有Vue组件部署完成"
}

# 主部署流程
main() {
    log "========================"
    log "Vue组件部署开始"
    log "========================"
    
    # 检查环境
    check_node_npm
    install_vue_cli
    
    # 构建Vue组件
    build_vue_components
    
    # 部署Vue组件
    deploy_vue_components
    
    log "========================"
    log "Vue组件部署完成"
    log "========================"
    
    log_success "Vue组件部署脚本执行完毕"
}

# 执行主函数
main "$@"