// ============================================================
// 向日葵创建和管理模块
// ============================================================

class Flower {
    constructor(scene) {
        this.scene = scene;
        this.flowerHead = new THREE.Group();
        this.innerPetals = [];
        this.outerPetals = [];
        this.centerGroup = new THREE.Group();
        this.leaves = [];
        this.stemMesh = null;
        this.stemCurve = null;

        this.state = {
            stemGrowth: 0,
            bloom: 0,
            rotation: 0,
            speed: CONFIG.animation.baseSpeed
        };
    }

    /**
     * 创建花茎（使用三次样条曲线模拟自然弯曲）
     */
    createStem(growth = 1) {
        const points = [];
        const segments = 20;  // 增加分段数使曲线更平滑
        const height = growth * CONFIG.flower.stem.baseHeight;

        // 使用正弦和多项式组合创建更自然的弯曲
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            // 主弯曲 - 使用正弦函数
            const mainBend = Math.sin(t * Math.PI * 0.5) * 0.2 * growth;
            // 次弯曲 - 增加自然的不规则感
            const secondaryBend = Math.sin(t * Math.PI * 1.5) * 0.08 * growth;
            // 顶部弯曲 - 模拟花朵重量导致的下垂
            const tipBend = Math.pow(t, 2.5) * 0.12 * growth;

            const x = mainBend + secondaryBend + tipBend;
            const z = Math.sin(t * Math.PI * 0.8) * 0.1 * growth;
            const y = t * height * (1 - 0.05 * Math.sin(t * Math.PI)); // 稍微压缩底部

            points.push(new THREE.Vector3(x, y, z));
        }

        this.stemCurve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(
            this.stemCurve,
            CONFIG.flower.stem.segments,
            CONFIG.flower.stem.baseRadius * growth,
            CONFIG.flower.stem.radialSegments,
            false
        );
        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.flower.stem.color,
            shininess: CONFIG.flower.stem.shininess
        });

        this.stemMesh = new THREE.Mesh(geometry, material);
        this.stemMesh.castShadow = true;
        this.stemMesh.receiveShadow = true;
        this.stemMesh.visible = growth > 0;

        return this.stemMesh;
    }

    /**
     * 创建向日葵花瓣（长而尖，带波浪边缘）
     */
    createPetal(length, width) {
        const shape = new THREE.Shape();
        // 使用三次贝塞尔曲线创建更自然的花瓣形状
        shape.moveTo(0, 0);

        // 左侧边缘 - 多个三次贝塞尔曲线创建波浪效果
        shape.bezierCurveTo(
            width * 0.15, length * 0.1,      // 控制点1
            width * 0.35, length * 0.25,     // 控制点2
            width * 0.45, length * 0.45      // 终点1
        );
        shape.bezierCurveTo(
            width * 0.55, length * 0.6,      // 控制点1
            width * 0.5, length * 0.8,       // 控制点2
            width * 0.4, length * 0.85       // 终点2
        );
        shape.bezierCurveTo(
            width * 0.25, length * 0.9,      // 控制点1
            width * 0.1, length * 0.95,      // 控制点2
            0, length                         // 尖端
        );

        // 右侧边缘 - 镜像但稍作变化增加自然感
        shape.bezierCurveTo(
            -width * 0.1, length * 0.95,     // 控制点1
            -width * 0.25, length * 0.9,     // 控制点2
            -width * 0.4, length * 0.85      // 终点1
        );
        shape.bezierCurveTo(
            -width * 0.5, length * 0.8,      // 控制点1
            -width * 0.55, length * 0.6,     // 控制点2
            -width * 0.45, length * 0.45     // 终点2
        );
        shape.bezierCurveTo(
            -width * 0.35, length * 0.25,    // 控制点1
            -width * 0.15, length * 0.1,     // 控制点2
            0, 0                             // 回到起点
        );

        const extrudeSettings = {
            steps: 1,
            depth: 0.03,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 3
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // 创建渐变材质（从黄色到橙色）
        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.flower.petal.baseColor,
            shininess: CONFIG.flower.petal.shininess,
            side: THREE.DoubleSide
        });

        const petal = new THREE.Mesh(geometry, material);
        petal.rotation.x = Math.PI / 2;
        petal.castShadow = true;
        petal.receiveShadow = true;
        petal.visible = false;

        // 存储原始属性
        petal.userData = {
            baseLength: length,
            baseWidth: width
        };

        return petal;
    }

    /**
     * 创建向日葵中心（深褐色花盘）
     */
    createCenter() {
        // 主花盘
        const geometry = new THREE.SphereGeometry(
            CONFIG.flower.center.radius,
            32,
            32
        );
        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.flower.center.baseColor,
            shininess: 20
        });

        const center = new THREE.Mesh(geometry, material);
        center.castShadow = true;
        center.visible = false;
        this.centerGroup.add(center);

        // 添加小种子纹理（用小圆点模拟）
        const seedGeometry = new THREE.SphereGeometry(CONFIG.flower.center.seedRadius, 8, 6);
        const seedMaterial = new THREE.MeshPhongMaterial({
            color: CONFIG.flower.center.seedColor
        });

        for (let i = 0; i < CONFIG.flower.center.seedCount; i++) {
            const seed = new THREE.Mesh(seedGeometry, seedMaterial);

            // 使用斐波那契螺旋分布种子
            const angle = i * 2.39996; // 黄金角
            const radius = CONFIG.flower.center.radius * Math.sqrt(i / CONFIG.flower.center.seedCount) * 0.85;

            seed.position.x = Math.cos(angle) * radius;
            seed.position.y = Math.sin(angle) * radius;
            seed.position.z = CONFIG.flower.center.radius * 0.3;

            seed.castShadow = true;
            this.centerGroup.add(seed);
        }

        this.centerGroup.visible = false;
        return this.centerGroup;
    }

    /**
     * 创建向日葵叶子（大而宽，带叶脉和波浪边缘）
     */
    createLeaf(length, width) {
        const shape = new THREE.Shape();
        // 使用三次贝塞尔曲线创建带波浪边缘的叶子形状
        shape.moveTo(0, 0);

        // 叶子左侧边缘 - 带波浪
        shape.bezierCurveTo(
            width * 0.3, -length * 0.15,     // 控制点1
            width * 0.7, -length * 0.1,      // 控制点2
            width, 0                         // 终点
        );
        // 叶尖
        shape.bezierCurveTo(
            width * 0.85, length * 0.15,     // 控制点1
            width * 0.65, length * 0.35,     // 控制点2
            width * 0.5, length * 0.5        // 终点
        );
        shape.bezierCurveTo(
            width * 0.35, length * 0.7,      // 控制点1
            width * 0.2, length * 0.85,      // 控制点2
            0, length                        // 叶尖
        );

        // 叶子右侧边缘 - 带波浪（镜像）
        shape.bezierCurveTo(
            -width * 0.2, length * 0.85,    // 控制点1
            -width * 0.35, length * 0.7,     // 控制点2
            -width * 0.5, length * 0.5      // 终点
        );
        shape.bezierCurveTo(
            -width * 0.65, length * 0.35,    // 控制点1
            -width * 0.85, length * 0.15,    // 控制点2
            -width, 0                        // 终点
        );
        shape.bezierCurveTo(
            -width * 0.7, -length * 0.1,     // 控制点1
            -width * 0.3, -length * 0.15,    // 控制点2
            0, 0                             // 回到起点
        );

        // 添加叶脉（使用 holes）
        const holes = [];
        // 主叶脉
        const mainVein = new THREE.Path();
        mainVein.moveTo(0, 0);
        mainVein.bezierCurveTo(
            width * 0.05, length * 0.25,
            -width * 0.05, length * 0.5,
            0, length * 0.75
        );
        holes.push(mainVein);

        shape.holes = holes;

        const extrudeSettings = {
            steps: 1,
            depth: 0.05,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.03,
            bevelSegments: 3
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.flower.leaf.color,
            shininess: CONFIG.flower.leaf.shininess,
            side: THREE.DoubleSide
        });

        const leaf = new THREE.Mesh(geometry, material);
        leaf.rotation.x = Math.PI / 2;
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        leaf.visible = false;

        leaf.userData = {
            baseLength: length,
            baseWidth: width
        };

        return leaf;
    }

    /**
     * 初始化向日葵
     */
    init() {
        // 创建花茎（初始时不创建，等待更新时创建）
        this.stemMesh = null;

        // 创建内层花瓣
        for (let i = 0; i < CONFIG.flower.petal.innerCount; i++) {
            const petal = this.createPetal(
                CONFIG.flower.petal.innerLength,
                CONFIG.flower.petal.innerWidth
            );
            const angle = (Math.PI * 2 / CONFIG.flower.petal.innerCount) * i;
            petal.rotation.y = -angle + Math.PI / 2;
            this.innerPetals.push(petal);
            this.flowerHead.add(petal);
        }

        // 创建外层花瓣
        for (let i = 0; i < CONFIG.flower.petal.outerCount; i++) {
            const petal = this.createPetal(
                CONFIG.flower.petal.outerLength,
                CONFIG.flower.petal.outerWidth
            );
            const angle = (Math.PI * 2 / CONFIG.flower.petal.outerCount) * i + (Math.PI / CONFIG.flower.petal.outerCount);
            petal.rotation.y = -angle + Math.PI / 2;
            this.outerPetals.push(petal);
            this.flowerHead.add(petal);
        }

        // 创建中心花盘
        this.centerGroup = this.createCenter();
        this.flowerHead.add(this.centerGroup);

        // 创建叶子
        for (let i = 0; i < CONFIG.flower.leaf.count; i++) {
            const leaf = this.createLeaf(
                CONFIG.flower.leaf.baseLength,
                CONFIG.flower.leaf.baseWidth
            );

            // 交替分布叶子
            const yPos = CONFIG.flower.leaf.positionY[i];
            leaf.position.y = yPos;

            // 左右交替，使用更大的角度展开
            const side = i % 2 === 0 ? 1 : -1;
            const angleSpread = CONFIG.flower.leaf.angleSpread || 0.6;
            leaf.rotation.x = Math.PI / 2 - 0.3;
            leaf.rotation.y = side * angleSpread;
            // 保存基础旋转角度
            leaf.userData = {
                baseLength: CONFIG.flower.leaf.baseLength,
                baseWidth: CONFIG.flower.leaf.baseWidth,
                baseRotationY: side * angleSpread
            };

            this.leaves.push(leaf);
            this.flowerHead.add(leaf);
        }

        this.flowerHead.position.y = 0;
        this.flowerHead.visible = false;
        this.scene.add(this.flowerHead);
    }

    /**
     * 更新花茎几何体
     */
    updateStemGeometry(growth) {
        if (this.stemMesh) {
            this.scene.remove(this.stemMesh);
        }
        this.stemMesh = this.createStem(growth);
        this.scene.add(this.stemMesh);
    }

    /**
     * 更新向日葵生长
     */
    update(time) {
        // 茎生长阶段
        if (this.state.stemGrowth < 1) {
            this.state.stemGrowth += CONFIG.animation.stemGrowthRate * this.state.speed;
            if (this.state.stemGrowth > 1) this.state.stemGrowth = 1;

            const growth = this.state.stemGrowth;
            this.updateStemGeometry(growth);
            this.flowerHead.position.y = growth * CONFIG.flower.stem.baseHeight;
            this.flowerHead.visible = true;

            return Math.floor(growth * 40); // 返回进度
        }

        // 花朵绽放阶段
        if (this.state.bloom < 1) {
            this.state.bloom += CONFIG.animation.bloomGrowthRate * this.state.speed;
            if (this.state.bloom > 1) this.state.bloom = 1;
        }

        const bloom = this.state.bloom;

        // 更新内层花瓣
        this.innerPetals.forEach((petal, index) => {
            petal.visible = true;
            const scale = 0.1 + bloom * 0.9;
            petal.scale.setScalar(scale);

            const baseAngle = (Math.PI * 2 / this.innerPetals.length) * index;
            // 移除整体旋转，只保留轻微的自然摆动
            const currentAngle = baseAngle + this.state.rotation;

            petal.position.x = Math.cos(currentAngle) * 0.15 * bloom;
            petal.position.z = Math.sin(currentAngle) * 0.15 * bloom;
            // 轻微摆动，大幅降低幅度
            petal.position.y = Math.sin(time * CONFIG.animation.petalWaveSpeed + index * 0.1) * CONFIG.animation.petalWaveAmplitude * bloom;

            petal.rotation.y = -currentAngle + Math.PI / 2;
            petal.rotation.x = Math.PI / 2 + Math.sin(time * CONFIG.animation.petalWaveSpeed + index * 0.05) * CONFIG.animation.petalWaveAmplitude;
        });

        // 更新外层花瓣
        this.outerPetals.forEach((petal, index) => {
            petal.visible = true;
            const scale = 0.1 + bloom * 0.9;
            petal.scale.setScalar(scale);

            const baseAngle = (Math.PI * 2 / this.outerPetals.length) * index + (Math.PI / this.outerPetals.length);
            // 移除整体旋转，只保留轻微的自然摆动
            const currentAngle = baseAngle + this.state.rotation;

            petal.position.x = Math.cos(currentAngle) * 0.2 * bloom;
            petal.position.z = Math.sin(currentAngle) * 0.2 * bloom;
            // 轻微摆动，大幅降低幅度
            petal.position.y = Math.sin(time * CONFIG.animation.petalWaveSpeed + index * 0.1 + 0.5) * CONFIG.animation.petalWaveAmplitude * bloom;

            petal.rotation.y = -currentAngle + Math.PI / 2;
            petal.rotation.x = Math.PI / 2 + Math.sin(time * CONFIG.animation.petalWaveSpeed + index * 0.05 + 0.5) * CONFIG.animation.petalWaveAmplitude;
        });

        // 更新中心花盘
        this.centerGroup.visible = true;
        const centerScale = 0.1 + bloom * 0.9;
        this.centerGroup.scale.setScalar(centerScale);

        // 更新叶子
        this.leaves.forEach((leaf, index) => {
            const leafBloom = Math.max(0, (bloom - 0.2) / 0.8);
            leaf.visible = leafBloom > 0;
            leaf.scale.setScalar(leafBloom);
            // 移除持续旋转，只保留极轻微的风动效果
            leaf.rotation.y = (leaf.userData?.baseRotationY || leaf.rotation.y) + Math.sin(time * 0.5 + index * 0.5) * 0.005;

            const yPos = CONFIG.flower.leaf.positionY[index];
            leaf.position.y = yPos + (1 - leafBloom) * 1.5;
        });

        // 整体旋转
        this.state.rotation += CONFIG.animation.rotationSpeed * this.state.speed;

        return 40 + Math.floor(bloom * 60); // 返回进度
    }

    /**
     * 重置花朵状态
     */
    reset() {
        this.state.stemGrowth = 0;
        this.state.bloom = 0;
        this.state.rotation = 0;
        this.state.speed = CONFIG.animation.baseSpeed;

        this.innerPetals.forEach(p => p.visible = false);
        this.outerPetals.forEach(p => p.visible = false);
        this.centerGroup.visible = false;
        this.leaves.forEach(l => l.visible = false);
        this.flowerHead.visible = false;

        if (this.stemMesh) {
            this.scene.remove(this.stemMesh);
            this.stemMesh = null;
        }
    }

    /**
     * 调整生长速度
     */
    adjustSpeed(factor) {
        this.state.speed *= factor;
        this.state.speed = Math.max(
            CONFIG.animation.minSpeed,
            Math.min(CONFIG.animation.maxSpeed, this.state.speed)
        );
    }
}
