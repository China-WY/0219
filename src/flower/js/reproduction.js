// ============================================================
// 繁衍管理器
// ============================================================

class ReproductionManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    /**
     * 检查并处理繁衍
     * @param {Array} flowers - 当前花朵数组
     * @param {number} currentTime - 当前系统时间（秒）
     * @returns {Array} 新生成的花朵数组
     */
    checkReproduction(flowers, currentTime) {
        const newFlowers = [];
        const { maxGeneration, reproductionInterval, growthDuration } = CONFIG.system;
        const { maxChildren } = CONFIG.reproduction;

        flowers.forEach((flower, index) => {
            const flowerTime = currentTime - flower.birthTime;

            // 只有成熟且未达到最大代数的花朵才能繁衍
            if (flowerTime >= growthDuration && flower.generation < maxGeneration) {
                const reproductionCount = Math.floor((flowerTime - growthDuration) / reproductionInterval);
                const lastIdx = flower.lastReproductionIndex || 0;

                // 只允许最多繁衍一定数量的子花
                for (let i = lastIdx; i < reproductionCount && i < maxChildren; i++) {
                    const newPos = calculateNewFlowerPosition(
                        flower.x,
                        flower.y,
                        flower.seed,
                        i + 1
                    );

                    // 确保新花位置在画布范围内
                    const safeX = Math.max(100, Math.min(this.canvasWidth - 100, newPos.x));
                    const safeY = Math.max(200, Math.min(this.canvasHeight - 50, newPos.y));

                    newFlowers.push({
                        x: safeX,
                        y: safeY,
                        seed: (flower.seed * 31 + i * 17) % CONFIG.random.m,
                        birthTime: currentTime,
                        generation: flower.generation + 1,
                        lastReproductionIndex: 0
                    });
                }

                // 更新父花的繁衍索引
                flowers[index].lastReproductionIndex = Math.min(reproductionCount, maxChildren);
            }
        });

        return newFlowers;
    }

    /**
     * 限制花朵总数，防止性能问题
     * @param {Array} flowers - 当前花朵数组
     * @returns {Array} 限制后的花朵数组
     */
    limitFlowerCount(flowers) {
        const { maxFlowers } = CONFIG.system;
        if (flowers.length > maxFlowers) {
            return flowers.slice(-maxFlowers);
        }
        return flowers;
    }

    /**
     * 更新画布尺寸
     * @param {number} width - 画布宽度
     * @param {number} height - 画布高度
     */
    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}
