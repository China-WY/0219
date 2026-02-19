// ============================================================
// 场景管理模块
// ============================================================

class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.container = null;
    }

    /**
     * 初始化场景
     */
    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.scene.backgroundColor);
        this.scene.fog = new THREE.Fog(
            CONFIG.scene.fogColor,
            CONFIG.scene.fogNear,
            CONFIG.scene.fogFar
        );
    }

    /**
     * 初始化相机
     */
    initCamera(width, height) {
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            width / height,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        this.camera.position.set(
            CONFIG.camera.position.x,
            CONFIG.camera.position.y,
            CONFIG.camera.position.z
        );
        return this.camera;
    }

    /**
     * 初始化渲染器
     * @param {HTMLElement} container - 容器元素
     */
    initRenderer(container) {
        this.container = container;
        this.renderer = new THREE.WebGLRenderer({
            antialias: CONFIG.renderer.antialias
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = CONFIG.renderer.shadowMapEnabled;

        const shadowMapType = THREE[CONFIG.renderer.shadowMapType];
        if (shadowMapType) {
            this.renderer.shadowMap.type = shadowMapType;
        }

        container.appendChild(this.renderer.domElement);
        return this.renderer;
    }

    /**
     * 初始化轨道控制器
     */
    initControls() {
        this.controls = new THREE.OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.controls.enableDamping = CONFIG.controls.enableDamping;
        this.controls.dampingFactor = CONFIG.controls.dampingFactor;
        this.controls.minDistance = CONFIG.controls.minDistance;
        this.controls.maxDistance = CONFIG.controls.maxDistance;
        this.controls.maxPolarAngle = CONFIG.controls.maxPolarAngle;
        return this.controls;
    }

    /**
     * 添加光源
     */
    addLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(
            CONFIG.lights.ambient.color,
            CONFIG.lights.ambient.intensity
        );
        this.scene.add(ambientLight);

        // 主光源
        const mainLight = new THREE.DirectionalLight(
            CONFIG.lights.main.color,
            CONFIG.lights.main.intensity
        );
        mainLight.position.set(
            CONFIG.lights.main.position.x,
            CONFIG.lights.main.position.y,
            CONFIG.lights.main.position.z
        );
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -15;
        mainLight.shadow.camera.right = 15;
        mainLight.shadow.camera.top = 15;
        mainLight.shadow.camera.bottom = -15;
        this.scene.add(mainLight);

        // 补光
        const fillLight = new THREE.DirectionalLight(
            CONFIG.lights.fill.color,
            CONFIG.lights.fill.intensity
        );
        fillLight.position.set(
            CONFIG.lights.fill.position.x,
            CONFIG.lights.fill.position.y,
            CONFIG.lights.fill.position.z
        );
        this.scene.add(fillLight);
    }

    /**
     * 窗口大小调整
     */
    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * 渲染场景
     */
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * 添加对象到场景
     */
    add(object) {
        this.scene.add(object);
    }

    /**
     * 从场景移除对象
     */
    remove(object) {
        this.scene.remove(object);
    }
}
