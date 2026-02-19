// ============================================================
// 花朵创建和管理模块
// ============================================================

class Flower {
    constructor(scene) {
        this.scene = scene;
        this.flowerHead = new THREE.Group();
        this.petals = [];
        this.leaves = [];
        this.center = null;
        this.stemMesh = null;
        this.stemCurve = null;

        this.state = {
            stemGrowth: 0,
            bloom: 0,
            rotation: 0,
            colorHue: 0,
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
                Math.sin(t * Math.PI * 0.5) * 0.1 * growth,
                t * height,
                Math.sin(t * Math.PI * 0.5) * 0.05 * growth
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
     * 创建单个花瓣
     */
    createPetal() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.bezierCurveTo(0.5, 0.8, 0.4, 1.8, 0, 2.5);
        shape.bezierCurveTo(-0.4, 1.8, -0.5, 0.8, 0, 0);

        const extrudeSettings = {
            steps: 1,
            depth: 0.05,
            bevelEnabled: true,
            bevelThickness: CONFIG.flower.petal.bevelThickness,
            bevelSize: CONFIG.flower.petal.bevelSize,
            bevelSegments: 5
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.flower.petal.color,
            shininess: CONFIG.flower.petal.shininess,
            side: THREE.DoubleSide
        });

        const petal = new THREE.Mesh(geometry, material);
        petal.rotation.x = Math.PI / 2;
        petal.castShadow = true;
        petal.receiveShadow = true;
        petal.visible = false;

        return petal;
    }

    /**
     * 创建花朵中心
     */
    createCenter() {
        const geometry = new THREE.SphereGeometry(
            CONFIG.flower.center.radius,
            CONFIG.flower.center.segments,
            CONFIG.flower.center.segments
        );
        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.flower.center.color,
            shininess: CONFIG.flower.center.shininess
        });

        this.center = new THREE.Mesh(geometry, material);
        this.center.castShadow = true;
        this.center.visible = false;

        return this.center;
    }

    /**
     * 创建叶子
     */
    createLeaf() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(0.8, -0.3, 2, 0);
        shape.quadraticCurveTo(0.8, 0.2, 0, 0);

        const extrudeSettings = {
            steps: 1,
            depth: 0.03,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
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

        return leaf;
    }

    /**
     * 初始化花朵
     */
    init() {
        // 创建花茎（初始时不创建，等待更新时创建）
        this.stemMesh = null;

        // 创建花瓣
        for (let i = 0; i < CONFIG.flower.petal.count; i++) {
            const petal = this.createPetal();
            const angle = (Math.PI * 2 / CONFIG.flower.petal.count) * i;
            petal.position.x = Math.cos(angle) * 0.1;
            petal.position.z = Math.sin(angle) * 0.1;
            petal.rotation.y = -angle + Math.PI / 2;
            this.petals.push(petal);
            this.flowerHead.add(petal);
        }

        // 创建花朵中心
        this.center = this.createCenter();
        this.flowerHead.add(this.center);

        // 创建叶子
        for (let i = 0; i < CONFIG.flower.leaf.count; i++) {
            const leaf = this.createLeaf();
            leaf.position.y = CONFIG.flower.leaf.positionY;
            leaf.rotation.x = Math.PI / 2 - 0.5 + i * 0.3;
            leaf.rotation.y = i === 0 ? 0.3 : -0.3;
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
     * 更新花朵生长
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

        // 更新花瓣
        this.petals.forEach((petal, index) => {
            petal.visible = true;
            const scale = 0.2 + bloom * 0.8;
            petal.scale.setScalar(scale);

            const baseAngle = (Math.PI * 2 / this.petals.length) * index;
            const currentAngle = baseAngle + this.state.rotation;

            petal.position.x = Math.cos(currentAngle) * 0.2 * bloom;
            petal.position.z = Math.sin(currentAngle) * 0.2 * bloom;
            petal.position.y = Math.sin(time * 2 + index) * 0.1 * bloom;

            petal.rotation.y = -currentAngle + Math.PI / 2;
            petal.rotation.x = Math.PI / 2 + Math.sin(time * 2 + index * 0.5) * 0.1;

            const hue = (this.state.colorHue + index * 45) % 360;
            petal.material.color.setHSL(hue / 360, 0.7, 0.5);
        });

        // 更新中心
        this.center.visible = true;
        const centerScale = 0.2 + bloom * 0.8;
        this.center.scale.setScalar(centerScale);
        const centerHue = (this.state.colorHue + 180) % 360;
        this.center.material.color.setHSL(centerHue / 360, 0.8, 0.5);

        // 更新叶子
        this.leaves.forEach((leaf, index) => {
            const leafBloom = Math.max(0, (bloom - 0.3) / 0.7);
            leaf.visible = leafBloom > 0;
            leaf.scale.setScalar(leafBloom);
            leaf.rotation.y = (index === 0 ? 0.3 : -0.3) + Math.sin(time + index) * 0.2;
            leaf.position.y = CONFIG.flower.leaf.positionY + (1 - leafBloom) * 2.5;
        });

        // 整体旋转和颜色变化
        this.state.rotation += CONFIG.animation.rotationSpeed * this.state.speed;
        this.state.colorHue += CONFIG.animation.colorChangeSpeed * this.state.speed;
        if (this.state.colorHue > 360) this.state.colorHue -= 360;

        return 40 + Math.floor(bloom * 60); // 返回进度
    }

    /**
     * 重置花朵状态
     */
    reset() {
        this.state.stemGrowth = 0;
        this.state.bloom = 0;
        this.state.rotation = 0;
        this.state.colorHue = 0;
        this.state.speed = CONFIG.animation.baseSpeed;

        this.petals.forEach(p => p.visible = false);
        if (this.center) this.center.visible = false;
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
