// ============================================================
// Canvas 2D 纯函数花朵系统应用主文件
// ============================================================

class FlowerSystem {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.infoEl = document.getElementById('info');
        this.renderer = new FlowerRenderer(this.canvas);
        this.reproductionManager = new ReproductionManager(this.canvas.width, this.canvas.height);

        this.flowers = [];
        this.startTime = null;
        this.animationId = null;

        this.init();
    }

    /**
     * 初始化系统
     */
    init() {
        this.resizeCanvas();
        this.initFlowers();
        this.bindEvents();
        this.start();
    }

    /**
     * 调整画布尺寸
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.renderer.resize(this.canvas.width, this.canvas.height);
        this.reproductionManager.resize(this.canvas.width, this.canvas.height);
    }

    /**
     * 初始化花朵
     */
    initFlowers() {
        this.flowers = [{
            x: this.canvas.width / 2,
            y: this.canvas.height * 0.8,
            seed: CONFIG.system.baseSeed,
            birthTime: 0,
            generation: 0,
            lastReproductionIndex: 0
        }];
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            // 更新第一朵花的位置
            if (this.flowers.length > 0) {
                this.flowers[0].x = this.canvas.width / 2;
                this.flowers[0].y = this.canvas.height * 0.8;
            }
        });
    }

    /**
     * 更新信息面板
     */
    updateInfo(currentTime) {
        const totalSeconds = Math.floor(currentTime);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const flowerCount = this.flowers.length;
        const matureFlowers = this.flowers.filter(f => currentTime - f.birthTime >= CONFIG.system.growthDuration).length;

        this.infoEl.innerHTML = `系统: ${minutes}分${seconds}秒 | 花朵: ${flowerCount} | 成熟: ${matureFlowers}<br>
            <span style="font-size:12px;opacity:0.6">纯函数驱动 | 确定性生长</span>`;
    }

    /**
     * 动画循环
     */
    animate(timestamp) {
        if (!this.startTime) {
            this.startTime = timestamp;
        }

        const currentTime = (timestamp - this.startTime) / 1000;

        // 清空画布并绘制背景
        this.renderer.clear();
        this.renderer.drawBackground(currentTime);

        // 绘制所有花朵
        this.flowers.forEach(flower => {
            const flowerTime = currentTime - flower.birthTime;
            const flowerData = generateFlower(flower.x, flower.y, flower.seed, flowerTime);
            this.renderer.drawFlower(flowerData);
        });

        // 处理繁衍
        const newFlowers = this.reproductionManager.checkReproduction(this.flowers, currentTime);
        this.flowers = [...this.flowers, ...newFlowers];

        // 限制花朵数量
        this.flowers = this.reproductionManager.limitFlowerCount(this.flowers);

        // 更新信息
        this.updateInfo(currentTime);

        // 继续动画循环
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    /**
     * 启动系统
     */
    start() {
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    /**
     * 停止系统
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * 重置系统
     */
    reset() {
        this.stop();
        this.startTime = null;
        this.initFlowers();
        this.start();
    }
}

// 页面加载完成后启动系统
window.addEventListener('DOMContentLoaded', () => {
    new FlowerSystem();
});
