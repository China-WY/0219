// ============================================================
// 纯函数花朵生成器
// ============================================================

/**
 * 生长曲线函数 - 纯函数
 * @param {number} timeS - 时间（秒）
 * @returns {number} 生长进度 0-1
 */
function growthCurve(timeS) {
    if (timeS <= 0) return 0;
    if (timeS >= CONFIG.system.growthDuration) return 1;
    return Math.sin((timeS / CONFIG.system.growthDuration) * Math.PI / 2);
}

/**
 * 花朵生成函数 - 纯函数
 * @param {number} baseX - 基础X坐标
 * @param {number} baseY - 基础Y坐标
 * @param {number} seed - 种子值
 * @param {number} timeS - 当前生长时间（秒）
 * @returns {Object} 花朵完整形态描述对象
 */
function generateFlower(baseX, baseY, seed, timeS) {
    const growth = growthCurve(timeS);

    // 花茎参数
    const stemLength = CONFIG.stem.baseLength + growth * CONFIG.stem.maxLength;
    const stemBend = Math.sin(seed * 2.3) * 30;

    // 叶片参数
    const leafCount = CONFIG.leaf.baseCount + deterministicInt(seed, 2, 0, CONFIG.leaf.maxCount - CONFIG.leaf.baseCount + 1);
    const leafSize = CONFIG.leaf.baseSize + growth * CONFIG.leaf.maxSize;
    const leafAngle = Math.PI / 6 + growth * Math.PI / 6;

    // 花瓣参数
    const petalCount = CONFIG.petal.baseCount + deterministicInt(seed, 1, 0, CONFIG.petal.maxCount - CONFIG.petal.baseCount + 1);
    const petalLength = CONFIG.petal.baseLength + growth * CONFIG.petal.maxLength;
    const petalWidth = petalLength * (0.4 + deterministicRandom(seed, 3) * 0.2);
    const petalSpread = growth * Math.PI / 3;

    // 花蕊参数
    const pistilRadius = CONFIG.pistil.baseRadius + deterministicRandom(seed, 4) * (CONFIG.pistil.maxRadius - CONFIG.pistil.baseRadius);
    const stamenCount = CONFIG.stamen.baseCount + deterministicInt(seed, 5, 0, CONFIG.stamen.maxCount - CONFIG.stamen.baseCount + 1);

    return {
        baseX,
        baseY,
        seed,
        timeS,
        growth,
        // 花茎
        stemLength,
        stemBend,
        // 叶片
        leafCount,
        leafSize,
        leafAngle,
        // 花瓣
        petalCount,
        petalLength,
        petalWidth,
        petalSpread,
        // 花蕊
        pistilRadius,
        stamenCount
    };
}

/**
 * 计算新花位置 - 纯函数
 * @param {number} parentX - 父花X坐标
 * @param {number} parentY - 父花Y坐标
 * @param {number} parentSeed - 父花种子
 * @param {number} generation - 子花代数
 * @returns {Object} {x, y} 新花位置
 */
function calculateNewFlowerPosition(parentX, parentY, parentSeed, generation) {
    const angle = (parentSeed * 7.31 + generation * 2.13) % (Math.PI * 2);
    const distance = CONFIG.reproduction.baseDistance + (parentSeed * 3.14 % (CONFIG.reproduction.maxDistance - CONFIG.reproduction.baseDistance));
    return {
        x: parentX + Math.cos(angle) * distance,
        y: parentY + Math.sin(angle) * distance * 0.6
    };
}
