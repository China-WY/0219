// ============================================================
// 确定性随机数生成器（LCG算法）
// ============================================================

const { a: LCG_A, c: LCG_C, m: LCG_M } = CONFIG.random;

/**
 * 线性同余生成器 - 确定性随机数
 * @param {number} seed - 种子值
 * @param {number} n - 序列索引
 * @returns {number} 0到1之间的随机数
 */
function deterministicRandom(seed, n) {
    let state = (seed + n * 997) % LCG_M;
    return ((LCG_A * state + LCG_C) % LCG_M) / LCG_M;
}

/**
 * 确定性整数生成器
 * @param {number} seed - 种子值
 * @param {number} n - 序列索引
 * @param {number} minVal - 最小值（包含）
 * @param {number} maxVal - 最大值（不包含）
 * @returns {number} minVal到maxVal-1之间的整数
 */
function deterministicInt(seed, n, minVal, maxVal) {
    return Math.floor(deterministicRandom(seed, n) * (maxVal - minVal) + minVal);
}

/**
 * 确定性浮点数生成器（范围）
 * @param {number} seed - 种子值
 * @param {number} n - 序列索引
 * @param {number} minVal - 最小值
 * @param {number} maxVal - 最大值
 * @returns {number} minVal到maxVal之间的浮点数
 */
function deterministicFloat(seed, n, minVal, maxVal) {
    return deterministicRandom(seed, n) * (maxVal - minVal) + minVal;
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { deterministicRandom, deterministicInt, deterministicFloat };
}
