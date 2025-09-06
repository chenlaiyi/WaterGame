# 点点够净水消消乐 - 项目结构说明

## 1. 项目概述

点点够净水消消乐是一款集教育性、趣味性、营销性于一体的微信小游戏。游戏以消消乐为核心玩法，结合密室逃脱的时间压力，让玩家在游戏中学习水质知识，了解净水器的重要性，体验点点够品牌的产品特色。

## 2. 项目目录结构

```
Water-Game/
├── cloudfunctions/                 # 云函数目录
│   ├── userLogin/                  # 用户登录云函数
│   │   ├── index.js                # 云函数入口文件
│   │   ├── config.json             # 云函数配置
│   │   └── package.json            # 依赖配置
│   ├── updateGameData/             # 游戏数据更新云函数
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   └── getRankings/                # 排行榜获取云函数
│       ├── index.js
│       ├── config.json
│       └── package.json
├── images/                         # 图片资源目录
│   ├── avatars/                    # 用户头像目录
│   ├── products/                   # 产品图片目录
│   ├── icons/                      # 图标目录
│   └── share_image.png             # 分享图片
├── middleware/                     # 中间件目录
├── pages/                          # 页面目录
│   ├── index/                      # 首页
│   │   ├── index.js                # 首页逻辑
│   │   ├── index.wxml              # 首页结构
│   │   └── index.wxss              # 首页样式
│   ├── game/                       # 游戏页面
│   │   ├── game.js                 # 游戏逻辑
│   │   ├── game.wxml               # 游戏结构
│   │   └── game.wxss               # 游戏样式
│   ├── waterTest/                  # 水质检测页面
│   │   ├── waterTest.js            # 检测逻辑
│   │   ├── waterTest.wxml          # 检测结构
│   │   ├── waterTest.wxss          # 检测样式
│   │   └── waterTest.json          # 检测配置
│   ├── shop/                       # 商城页面
│   │   ├── shop.js                 # 商城逻辑
│   │   ├── shop.wxml               # 商城结构
│   │   ├── shop.wxss               # 商城样式
│   │   └── shop.json               # 商城配置
│   └── rank/                       # 排行榜页面
│       ├── rank.js                 # 排行逻辑
│       ├── rank.wxml               # 排行结构
│       ├── rank.wxss               # 排行样式
│       └── rank.json               # 排行配置
├── subpackages/                    # 分包目录
│   ├── waterTest/                  # 水质检测分包
│   └── revive/                     # 复活功能分包
├── utils/                          # 工具类目录
│   ├── GameManager.js              # 游戏状态管理
│   ├── MatchEngine.js              # 消消乐匹配逻辑
│   ├── PollutantBlocks.js          # 污染物方块定义
│   ├── ReviveRewardManager.js      # 复活奖励系统
│   ├── SmartControlManager.js      # 5G智能控制模拟
│   ├── WechatGameAdapter.js        # 微信API适配
│   ├── BrandMarketingManager.js    # 品牌营销功能
│   ├── InputValidator.js           # 输入验证
│   └── Logger.js                   # 日志记录
├── workers/                        # Worker目录
├── vue-components/                 # Vue组件目录（管理后台）
├── app.js                          # 应用入口文件
├── app.json                        # 应用配置文件
├── app.wxss                        # 全局样式文件
├── game.json                       # 游戏配置文件
├── sitemap.json                    # 站点地图
├── project.config.json             # 项目配置文件
├── package.json                    # npm配置文件
├── create_game_tables.sql          # 数据库初始化脚本
├── deploy_game_backend.sh          # 后端部署脚本
├── deploy_vue_components.sh        # Vue组件部署脚本
├── README.md                       # 项目说明文档
├── DEPLOYMENT.md                   # 部署指南
├── PROJECT_STRUCTURE.md            # 项目结构说明
├── integration_guide.md            # 集成指南
├── test_plan.md                    # 测试计划
└── test_report.md                  # 测试报告
```

## 3. 核心模块说明

### 3.1 游戏引擎模块
- **GameManager.js**: 负责游戏状态管理、关卡控制、游戏流程控制
- **MatchEngine.js**: 处理消消乐核心匹配逻辑、连击计算、消除效果

### 3.2 游戏内容模块
- **PollutantBlocks.js**: 定义三种污染物类型（颗粒、微生物、化学）及其特性
- **waterTest/**: 水质检测教育小游戏，包含TDS、余氯、PH、矿物质、电解实验

### 3.3 系统功能模块
- **ReviveRewardManager.js**: 复活奖励系统，支持看广告和分享复活
- **SmartControlManager.js**: 5G智能控制模拟，设备状态监控和远程控制
- **WechatGameAdapter.js**: 微信小游戏API适配，统一处理微信接口调用
- **BrandMarketingManager.js**: 品牌营销功能，展示品牌故事和产品优势

### 3.4 工具类模块
- **Logger.js**: 统一日志记录工具
- **InputValidator.js**: 输入验证工具
- **InputValidator.js**: 输入验证工具

### 3.5 云函数模块
- **userLogin/**: 用户登录和注册
- **updateGameData/**: 游戏数据更新
- **getRankings/**: 排行榜数据获取

## 4. 页面功能说明

### 4.1 首页 (pages/index/)
- 关卡选择和进入
- 用户信息展示
- 设置功能
- 功能入口（水质检测、商城、排行榜、品牌故事）

### 4.2 游戏页 (pages/game/)
- 核心消消乐游戏界面
- 分数和时间显示
- 道具使用
- 暂停和重新开始功能

### 4.3 水质检测页 (pages/waterTest/)
- TDS检测模拟
- 余氯检测实验
- PH值测试
- 矿物质收集
- 电解实验对比

### 4.4 商城页 (pages/shop/)
- 产品展示和购买
- 优惠券领取
- 水质知识浏览
- 客服联系

### 4.5 排行榜页 (pages/rank/)
- 分数排行榜
- 等级排行榜
- 金币排行榜
- 用户排名显示

## 5. 配置文件说明

### 5.1 应用配置
- **app.json**: 应用页面配置、窗口样式、云开发设置
- **game.json**: 游戏特定配置，如设备方向、网络超时等
- **project.config.json**: 微信开发者工具项目配置

### 5.2 样式配置
- **app.wxss**: 全局样式定义
- **各页面.wxss**: 页面特定样式

### 5.3 云函数配置
- **各云函数目录下的config.json**: 云函数权限和API配置

## 6. 资源文件说明

### 6.1 图片资源
- **avatars/**: 用户头像图片
- **products/**: 产品展示图片
- **icons/**: 功能图标
- **share_image.png**: 分享图片

### 6.2 数据库脚本
- **create_game_tables.sql**: 数据库初始化脚本

## 7. 部署和维护

### 7.1 部署脚本
- **deploy_game_backend.sh**: 后端云函数和数据库部署
- **deploy_vue_components.sh**: Vue组件部署

### 7.2 文档文件
- **README.md**: 项目说明
- **DEPLOYMENT.md**: 部署指南
- **integration_guide.md**: 集成指南
- **test_plan.md**: 测试计划
- **test_report.md**: 测试报告

## 8. 开发规范

### 8.1 代码规范
- 使用ES6语法
- 遵循微信小程序开发规范
- 统一的命名规范
- 详细的注释说明

### 8.2 项目管理
- 功能模块化设计
- 代码复用性考虑
- 性能优化
- 错误处理机制

---
*让每一滴水都纯净，让每一次游戏都有意义。*