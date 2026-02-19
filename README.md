# 花朵动画系统

基于数学函数驱动的可生长、可繁衍虚拟花朵系统。

## 项目概述

本项目包含两个独立的花朵动画演示：

- **3D 花朵动画** - 使用 Three.js 构建的 3D 花朵生长演示
- **纯函数花朵系统** - 基于 Canvas 2D 的纯函数驱动花朵系统

## 项目结构

```
f:\AAA\
├── index.html              # 主入口页面
├── package.json            # 项目配置
├── README.md               # 项目说明
├── SPEC.md                 # 技术规范（已弃用，移至docs目录）
├── src/
│   ├── particle/           # Three.js 3D花朵
│   │   ├── index.html
│   │   ├── style.css
│   │   └── js/
│   │       ├── config.js   # 配置
│   │       ├── scene.js    # 场景管理
│   │       ├── environment.js # 环境元素（地面、草、星星）
│   │       ├── flower.js   # 花朵生成和更新
│   │       └── app.js      # 应用主文件
│   └── flower/             # Canvas 2D花朵
│       ├── index.html
│       ├── style.css
│       └── js/
│           ├── config.js   # 配置
│           ├── random.js   # 确定性随机数生成器
│           ├── flowerGenerator.js # 纯函数花朵生成
│           ├── renderer.js # Canvas渲染器
│           ├── reproduction.js # 繁衍管理
│           └── app.js      # 应用主文件
└── docs/
    └── SPEC.md             # 技术规范
```

## 快速开始

### 使用本地服务器（推荐）

```bash
# 安装依赖
npm install

# 启动主服务器
npm start

# 访问 http://localhost:8080
```

### 直接打开

由于浏览器安全策略，建议使用本地服务器。如果直接打开 HTML 文件：

- 主入口: [index.html](index.html)
- 3D 花朵: [src/particle/index.html](src/particle/index.html)
- 2D 花朵: [src/flower/index.html](src/flower/index.html)

## 演示说明

### 3D 花朵动画

- **技术栈**: Three.js
- **交互**:
  - 鼠标拖动旋转视角
  - 滚轮缩放
  - 控制按钮：重新种植、加速生长、减缓生长
- **特性**:
  - 3D 渲染
  - 实时生长动画
  - 环境效果（地面、草、星星）

### 纯函数花朵系统

- **技术栈**: Canvas 2D
- **特性**:
  - 纯函数驱动（无状态、可复现）
  - 确定性随机数（LCG算法）
  - 自动繁衍机制
  - 最多5代繁衍
  - 最多50朵花同时显示

## 设计原则

### 代码组织

- **模块化**: 每个功能拆分为独立的模块
- **配置分离**: 所有配置集中在 `config.js`
- **单一职责**: 每个模块只负责一个功能领域
- **可维护性**: 清晰的代码结构和命名

### 技术特点

- **无外部依赖** (除 Three.js 项目使用 CDN)
- **纯函数设计** (Canvas 2D 项目)
- **确定性计算** (可复现的输出)
- **性能优化** (限制花朵数量，优化渲染)

## 技术规范

详细技术规范请查看 [docs/SPEC.md](docs/SPEC.md)

## 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 许可证

MIT
