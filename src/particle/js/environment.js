// ============================================================
// 环境创建模块（地面、草、星星）
// ============================================================

class Environment {
    constructor(scene) {
        this.scene = scene;
        this.grassBlades = [];
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
                (Math.random() - 0.5) * 10,
                0,
                (Math.random() - 0.5) * 10
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
     * 创建星星
     */
    createStars() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.stars.count * 3);

        for (let i = 0; i < CONFIG.stars.count; i++) {
            const radius = CONFIG.stars.minRadius +
                Math.random() * (CONFIG.stars.maxRadius - CONFIG.stars.minRadius);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.cos(phi) + CONFIG.stars.baseY;
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: CONFIG.stars.size,
            transparent: true,
            opacity: CONFIG.stars.opacity
        });

        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    }

    /**
     * 初始化所有环境元素
     */
    init() {
        this.createGround();
        this.createGrass();
        this.createStars();
    }
}
