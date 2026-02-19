// ============================================================
// 环境创建模块（地面、草、白云）
// ============================================================

class Environment {
    constructor(scene) {
        this.scene = scene;
        this.grassBlades = [];
        this.clouds = [];
    }

    /**
     * 创建地面
     */
    createGround() {
        const geometry = new THREE.CircleGeometry(
            CONFIG.ground.radius,
            CONFIG.ground.segments
        );
        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.ground.color,
            side: THREE.DoubleSide,
            flatShading: true
        });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // 添加小土丘
        this.createMounds();
    }

    /**
     * 创建土丘
     */
    createMounds() {
        for (let i = 0; i < CONFIG.ground.moundCount; i++) {
            const radius = CONFIG.ground.moundMinSize +
                Math.random() * (CONFIG.ground.moundMaxSize - CONFIG.ground.moundMinSize);
            const geometry = new THREE.SphereGeometry(radius, 8, 4);
            const material = new THREE.MeshPhongMaterial({
                color: CONFIG.ground.moundColor,
                flatShading: true
            });
            const mound = new THREE.Mesh(geometry, material);
            mound.scale.y = 0.4;
            mound.position.set(
                (Math.random() - 0.5) * 12,
                0,
                (Math.random() - 0.5) * 12
            );

            // 避免在花朵中心位置
            if (Math.abs(mound.position.x) > 1 || Math.abs(mound.position.z) > 1) {
                mound.receiveShadow = true;
                mound.castShadow = true;
                this.scene.add(mound);
            }
        }
    }

    /**
     * 创建草
     */
    createGrass() {
        const geometry = new THREE.ConeGeometry(
            CONFIG.grass.baseRadius,
            CONFIG.grass.baseHeight,
            CONFIG.grass.segments
        );
        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.grass.color,
            flatShading: true
        });

        for (let i = 0; i < CONFIG.grass.count; i++) {
            const grass = new THREE.Mesh(geometry, material.clone());

            grass.position.set(
                (Math.random() - 0.5) * CONFIG.grass.radius,
                0,
                (Math.random() - 0.5) * CONFIG.grass.radius
            );

            // 避开花朵中心区域
            const distanceFromCenter = Math.sqrt(
                grass.position.x ** 2 + grass.position.z ** 2
            );
            if (distanceFromCenter > CONFIG.grass.avoidanceRadius) {
                grass.scale.setScalar(0.5 + Math.random() * 0.8);
                grass.rotation.y = Math.random() * Math.PI * 2;
                grass.rotation.x = (Math.random() - 0.5) * 0.2;
                grass.castShadow = true;
                grass.receiveShadow = true;

                // 保存原始旋转和相位用于动画
                grass.userData = {
                    originalRotation: grass.rotation.clone(),
                    phase: Math.random() * Math.PI * 2
                };

                this.grassBlades.push(grass);
                this.scene.add(grass);
            }
        }
    }

    /**
     * 创建白云
     */
    createClouds() {
        const cloudCount = 5;

        for (let c = 0; c < cloudCount; c++) {
            const cloudGroup = new THREE.Group();
            const puffCount = 3 + Math.floor(Math.random() * 3);

            for (let p = 0; p < puffCount; p++) {
                const radius = 1.5 + Math.random() * 1.5;
                const geometry = new THREE.SphereGeometry(radius, 16, 16);
                const material = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.9,
                    flatShading: true
                });

                const puff = new THREE.Mesh(geometry, material);
                puff.position.set(
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 2
                );
                puff.castShadow = false;
                puff.receiveShadow = false;

                cloudGroup.add(puff);
            }

            // 随机位置在天空中
            cloudGroup.position.set(
                (Math.random() - 0.5) * 40,
                15 + Math.random() * 10,
                (Math.random() - 0.5) * 40
            );

            cloudGroup.userData = {
                speed: 0.005 + Math.random() * 0.01
            };

            this.clouds.push(cloudGroup);
            this.scene.add(cloudGroup);
        }
    }

    /**
     * 更新草的摆动
     */
    updateGrass(time) {
        this.grassBlades.forEach((grass) => {
            grass.rotation.x = grass.userData.originalRotation.x +
                Math.sin(time * 2 + grass.userData.phase) * 0.1;
            grass.rotation.z = Math.sin(time * 3 + grass.userData.phase) * 0.05;
        });
    }

    /**
     * 更新云的移动
     */
    updateClouds(time) {
        this.clouds.forEach((cloud) => {
            cloud.position.x += cloud.userData.speed;

            // 循环移动
            if (cloud.position.x > 30) {
                cloud.position.x = -30;
            }
        });
    }

    /**
     * 初始化所有环境元素
     */
    init() {
        this.createGround();
        this.createGrass();
        this.createClouds();
    }
}
