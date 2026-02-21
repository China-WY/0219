// ============================================================
// 向日葵创建和管理模块
// ============================================================

class Flower {
    constructor(scene) {
        this.scene = scene;
        this.flowerHead = new THREE.Group();  // 花瓣和中心
        this.leafGroup = new THREE.Group();      // 叶子独立组，避免碰撞
        this.innerPetals = [];
        this.outerPetals = [];
        this.centerGroup = new THREE.Group();
        this.leaves = [];
        this.stemMesh = null;
        this.stemCurve = null;

        // 碰撞检测相关
        this.collisionCount = 0;
        this.lastCollisionCheck = 0;
        this.collisionInfoElement = null;

        this.state = {
            stemGrowth: 0,
            bloom: 0,
            rotation: 0,
            speed: CONFIG.animation.baseSpeed
        };
    }

    /**
     * 计算包围盒
     */
    getBoundingBox(mesh) {
        const box = new THREE.Box3();
        box.setFromObject(mesh);
        return box;
    }

    /**
     * 检测两个包围盒是否相交
     */
    boxesIntersect(box1, box2) {
        return box1.intersectsBox(box2);
    }

    /**
     * 碰撞检测和避免算法
     */
    resolveCollisions() {
        // 限制碰撞检测频率（每 10 帧一次）
        const now = Date.now();
        if (now - this.lastCollisionCheck < 100) {
            return;
        }
        this.lastCollisionCheck = now;

        // 获取花头的包围盒（包含所有花瓣和中心）
        const flowerHeadBox = new THREE.Box3();
        flowerHeadBox.setFromObject(this.flowerHead);

        // 叶子之间以及叶子与花头之间的碰撞检测
        const resolvedPositions = new Map();
        let totalCollisions = 0;  // 本次检测的总碰撞次数

        this.leaves.forEach((leaf, leafIndex) => {

        this.leaves.forEach((leaf, leafIndex) => {
            const data = leaf.userData;

            // 初始目标位置
            const t = Math.max(0, Math.min(1, (this.state.stemGrowth * CONFIG.flower.stem.baseHeight + data.yPos) / CONFIG.flower.stem.baseHeight));
            const stemX = Math.sin(t * Math.PI * 0.5) * 0.2 * this.state.stemGrowth +
                          Math.sin(t * Math.PI * 1.5) * 0.08 * this.state.stemGrowth +
                          Math.pow(t, 2.5) * 0.12 * this.state.stemGrowth;
            const stemZ = Math.sin(t * Math.PI * 0.8) * 0.1 * this.state.stemGrowth;

            const leafRootY = this.state.stemGrowth * CONFIG.flower.stem.baseHeight + data.yPos;
            const stemHeight = this.state.stemGrowth * CONFIG.flower.stem.baseHeight;

            // 尝试不同的侧向展开角度，找到无碰撞的位置
            const side = data.side;
            let bestPosition = null;
            let bestRotation = null;
            let minCollisionPenalty = Infinity;

            // 尝试多个角度和位置
            const angleTries = 5;
            const positionTries = 3;

            for (let a = 0; a < angleTries; a++) {
                const angleSpread = 0.3 + a * 0.25;  // 从 0.3 到 1.2 的不同角度

                for (let p = 0; p < positionTries; p++) {
                    const offsetMultiplier = 0.8 + p * 0.4;  // 从 0.8 到 1.6 的不同偏移

                    // 计算候选位置
                    const leafExtendX = side * angleSpread * offsetMultiplier;
                    const leafExtendZ = side * 0.25 * offsetMultiplier;
                    const candidatePosition = new THREE.Vector3(
                        stemX + leafExtendX,
                        leafRootY,
                        stemZ + leafExtendZ
                    );

                    // 设置临时位置和旋转来检测碰撞
                    const originalPos = leaf.position.clone();
                    const originalRot = leaf.rotation.clone();
                    leaf.position.copy(candidatePosition);
                    leaf.rotation.set(
                        Math.PI / 2 - 0.3,
                        side * angleSpread,
                        0
                    );

                    // 获取叶子的包围盒
                    const leafBox = this.getBoundingBox(leaf);

                    // 计算碰撞惩罚（与花头和其他叶子的重叠程度）
                    let collisionPenalty = 0;

                    // 检测与花头的碰撞
                    if (flowerHeadBox.intersectsBox(leafBox)) {
                        collisionPenalty += 100;  // 与花头碰撞是高惩罚
                    }

                    // 检测与其他叶子的碰撞
                    for (let j = 0; j < this.leaves.length; j++) {
                        if (j === leafIndex) continue;

                        const otherLeaf = this.leaves[j];
                        if (!otherLeaf.visible) continue;

                        const otherPos = resolvedPositions.get(j) || otherLeaf.position.clone();

                        // 使用其他叶子的位置来创建临时包围盒
                        const tempPos = otherLeaf.position.clone();
                        otherLeaf.position.copy(tempPos);

                        const otherBox = this.getBoundingBox(otherLeaf);

                        // 恢复其他叶子位置
                        otherLeaf.position.copy(otherPos);

                        if (this.boxesIntersect(leafBox, otherBox)) {
                            collisionPenalty += 50;  // 叶子间碰撞是中等惩罚
                        }
                    }

                    // 计算到花头的距离（越远越好，但也不能太远）
                    const distanceToCenter = candidatePosition.distanceTo(new THREE.Vector3(0, stemHeight, 0));
                    const idealDistance = 1.5;  // 理想距离
                    const distancePenalty = Math.abs(distanceToCenter - idealDistance) * 10;

                    collisionPenalty += distancePenalty;

                    // 如果这是最好的位置
                    if (collisionPenalty < minCollisionPenalty) {
                        minCollisionPenalty = collisionPenalty;
                        bestPosition = candidatePosition.clone();
                        bestRotation = new THREE.Euler(
                            Math.PI / 2 - 0.3,
                            side * angleSpread,
                            0
                        );
                    }

                    // 恢复叶子原始位置
                    leaf.position.copy(originalPos);
                    leaf.rotation.copy(originalRot);
                }
            }

            // 应用最好的无碰撞位置
            if (bestPosition && bestRotation) {
                leaf.position.copy(bestPosition);
                leaf.rotation.copy(bestRotation);
                resolvedPositions.set(leafIndex, bestPosition.clone());
            }

            // 累计碰撞次数
            totalCollisions += Math.floor(minCollisionPenalty / 50);  // 每次碰撞增加计数
        });

        // 更新碰撞计数和显示
        this.collisionCount = totalCollisions;
        this.updateCollisionDisplay();
    }

    /**
     * 更新碰撞检测次数显示
     */
    updateCollisionDisplay() {
        if (!this.collisionInfoElement) {
            this.collisionInfoElement = document.getElementById('collisionInfo');
        }
        if (this.collisionInfoElement) {
            this.collisionInfoElement.textContent = `碰撞检测: ${this.collisionCount}`;
        }
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

            // 保存叶子的原始位置和角度数据
            leaf.userData = {
                yPos: CONFIG.flower.leaf.positionY[i],
                baseLength: CONFIG.flower.leaf.baseLength,
                baseWidth: CONFIG.flower.leaf.baseWidth,
                side: i % 2 === 0 ? 1 : -1,
                angleSpread: CONFIG.flower.leaf.angleSpread || 0.6,
                baseRotationY: (i % 2 === 0 ? 1 : -1) * (CONFIG.flower.leaf.angleSpread || 0.6)
            };

            this.leaves.push(leaf);
            // 将叶子添加到独立组，而不是 flowerHead
            this.leafGroup.add(leaf);
        }

        // 将两个组添加到场景
        this.flowerHead.position.y = 0;
        this.flowerHead.visible = false;
        this.leafGroup.visible = false;
        this.scene.add(this.flowerHead);
        this.scene.add(this.leafGroup);
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
        const growth = this.state.stemGrowth;
        const stemHeight = growth * CONFIG.flower.stem.baseHeight;

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

        // 更新叶子 - 使用绝对世界坐标，避免与花瓣碰撞
        this.leaves.forEach((leaf, index) => {
            const leafBloom = Math.max(0, (bloom - 0.2) / 0.8);
            leaf.visible = leafBloom > 0 && growth > 0.3;
            leaf.scale.setScalar(leafBloom);

            // 从 userData 获取叶子数据
            const data = leaf.userData;
            const side = data.side;
            const yPos = data.yPos;  // 叶子沿花茎的相对高度

            // 计算花茎在该高度的弯曲位置
            const t = Math.max(0, Math.min(1, (stemHeight + yPos) / CONFIG.flower.stem.baseHeight));
            const stemX = Math.sin(t * Math.PI * 0.5) * 0.2 * growth +
                          Math.sin(t * Math.PI * 1.5) * 0.08 * growth +
                          Math.pow(t, 2.5) * 0.12 * growth;
            const stemZ = Math.sin(t * Math.PI * 0.8) * 0.1 * growth;

            // 叶子的世界坐标位置（直接设置，不使用 leafGroup 的相对坐标）
            // 叶子根部在花茎上，向侧面展开
            const leafRootX = stemX;
            const leafRootY = stemHeight + yPos;
            const leafRootZ = stemZ;

            // 叶子向侧面展开，避免与花头重叠
            const leafExtendX = side * 1.2;  // 更大的侧向展开
            const leafExtendZ = side * 0.3;

            // 计算叶子位置（世界坐标）
            leaf.position.set(leafRootX + leafExtendX, leafRootY, leafRootZ + leafExtendZ);

            // 叶子朝向调整：指向侧面并稍微向上
            leaf.rotation.set(
                Math.PI / 2 - 0.4,  // 向上倾斜
                side * 0.8,              // 向侧面展开
                Math.sin(time * 0.3 + index * 0.3) * 0.03  // 轻微风动
            );
        });

        // 执行碰撞检测和避免
        this.resolveCollisions();

        // 更新叶子组位置跟随花茎
        this.leafGroup.position.set(0, stemHeight, 0);

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
        this.leafGroup.visible = false;  // 重置叶子组可见性

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
