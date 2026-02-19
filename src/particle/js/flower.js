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
     * 创建花茎
     */
    createStem(growth = 1) {
        const points = [];
        const segments = 10;
        const height = growth * CONFIG.flower.stem.baseHeight;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            points.push(new THREE.Vector3(
                Math.sin(t * Math.PI * 0.5) * 0.15 * growth,
                t * height,
                Math.sin(t * Math.PI * 0.5) * 0.08 * growth
            ));
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
     * 创建向日葵花瓣（长而尖）
     */
    createPetal(length, width) {
        const shape = new THREE.Shape();
        // 向日葵花瓣形状：细长，尖端尖锐
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(width * 0.3, length * 0.3, width * 0.5, length * 0.7);
        shape.quadraticCurveTo(width * 0.6, length * 0.9, 0, length);
        shape.quadraticCurveTo(-width * 0.6, length * 0.9, -width * 0.5, length * 0.7);
        shape.quadraticCurveTo(-width * 0.3, length * 0.3, 0, 0);

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
     * 创建向日葵叶子（大而宽）
     */
    createLeaf(length, width) {
        const shape = new THREE.Shape();
        // 向日葵叶子形状：宽大，心形
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(width * 0.5, -length * 0.2, width, 0);
        shape.quadraticCurveTo(width * 0.7, length * 0.3, 0, length);
        shape.quadraticCurveTo(-width * 0.7, length * 0.3, -width, 0);
        shape.quadraticCurveTo(-width * 0.5, -length * 0.2, 0, 0);

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

            // 左右交替
            const side = i % 2 === 0 ? 1 : -1;
            leaf.rotation.x = Math.PI / 2 - 0.2;
            leaf.rotation.y = side * 0.5;

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
            const currentAngle = baseAngle + this.state.rotation;

            petal.position.x = Math.cos(currentAngle) * 0.15 * bloom;
            petal.position.z = Math.sin(currentAngle) * 0.15 * bloom;
            petal.position.y = Math.sin(time * 2 + index * 0.1) * 0.05 * bloom;

            petal.rotation.y = -currentAngle + Math.PI / 2;
            petal.rotation.x = Math.PI / 2 + Math.sin(time * 2 + index * 0.05) * 0.05;
        });

        // 更新外层花瓣
        this.outerPetals.forEach((petal, index) => {
            petal.visible = true;
            const scale = 0.1 + bloom * 0.9;
            petal.scale.setScalar(scale);

            const baseAngle = (Math.PI * 2 / this.outerPetals.length) * index + (Math.PI / this.outerPetals.length);
            const currentAngle = baseAngle + this.state.rotation;

            petal.position.x = Math.cos(currentAngle) * 0.2 * bloom;
            petal.position.z = Math.sin(currentAngle) * 0.2 * bloom;
            petal.position.y = Math.sin(time * 2 + index * 0.1 + 0.5) * 0.05 * bloom;

            petal.rotation.y = -currentAngle + Math.PI / 2;
            petal.rotation.x = Math.PI / 2 + Math.sin(time * 2 + index * 0.05 + 0.5) * 0.05;
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
            leaf.rotation.y += Math.sin(time + index * 0.5) * 0.01;

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
