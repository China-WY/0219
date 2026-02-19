// ============================================================
// Three.js 3D 花朵应用主文件
// ============================================================

class FlowerApp {
    constructor() {
        this.sceneManager = null;
        this.flower = null;
        this.environment = null;
        this.time = 0;
        this.container = null;
        this.progressElement = null;

        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 获取容器
        this.container = document.getElementById('container');
        this.progressElement = document.getElementById('progressText');

        // 初始化场景管理器
        this.sceneManager = new SceneManager();
        this.sceneManager.init();
        this.sceneManager.initCamera(window.innerWidth, window.innerHeight);
        this.sceneManager.initRenderer(this.container);
        this.sceneManager.initControls();
        this.sceneManager.addLights();

        // 初始化环境
        this.environment = new Environment(this.sceneManager.scene);
        this.environment.init();

        // 初始化花朵
        this.flower = new Flower(this.sceneManager.scene);
        this.flower.init();

        // 绑定事件
        this.bindEvents();

        // 开始动画
        this.animate();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.sceneManager.onResize();
        });

        // 重置按钮
        document.getElementById('resetBtn')?.addEventListener('click', () => {
            this.flower.reset();
            this.time = 0;
        });

        // 加速按钮
        document.getElementById('speedUpBtn')?.addEventListener('click', () => {
            this.flower.adjustSpeed(1.5);
        });

        // 减速按钮
        document.getElementById('slowDownBtn')?.addEventListener('click', () => {
            this.flower.adjustSpeed(1 / 1.5);
        });
    }

    /**
     * 动画循环
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        this.time += 0.016 * this.flower.state.speed;

        // 更新花朵
        const progress = this.flower.update(this.time);
        if (this.progressElement) {
            this.progressElement.textContent = `生长进度: ${progress}%`;
        }

        // 更新草的摆动
        this.environment.updateGrass(this.time);

        // 更新控制器和渲染
        this.sceneManager.controls.update();
        this.sceneManager.render();
    }
}

// 页面加载完成后启动应用
window.addEventListener('DOMContentLoaded', () => {
    new FlowerApp();
});
