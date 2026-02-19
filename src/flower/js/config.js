// ============================================================
// Canvas 2D 纯函数花朵系统配置
// ============================================================

const CONFIG = {
    // 系统配置
    system: {
        baseSeed: 42,
        maxGeneration: 4,
        maxFlowers: 50,
        reproductionInterval: 5, // 繁衍间隔（秒）
        growthDuration: 60 // 生长时长（秒）
    },

    // 确定性随机数生成器参数（LCG算法）
    random: {
        a: 1103515245,
        c: 12345,
        m: 2147483647
    },

    // 背景配置
    background: {
        topColor: '#0a0a1a',
        bottomColor: '#1a1a3a',
        starCount: 20
    },

    // 花茎配置
    stem: {
        baseLength: 80,
        maxLength: 120,
        baseColor: '#2d5a27',
        topColor: '#4a7c43',
        baseWidth: 3,
        maxWidth: 5,
        segments: 10
    },

    // 叶片配置
    leaf: {
        baseSize: 20,
        maxSize: 30,
        baseCount: 2,
        maxCount: 4,
        baseColor: '#3d6b35',
        topColor: '#5a8f4f'
    },

    // 花瓣配置
    petal: {
        baseLength: 30,
        maxLength: 40,
        baseCount: 5,
        maxCount: 8,
        baseColor: '#d4738f',
        topColor: '#e8a4b8'
    },

    // 花蕊配置
    pistil: {
        baseRadius: 8,
        maxRadius: 15,
        baseColor: '#f4c542',
        topColor: '#e8a020'
    },

    // 雄蕊配置
    stamen: {
        baseCount: 6,
        maxCount: 12,
        color: '#e8a020',
        tipColor: '#f4c542'
    },

    // 繁衍配置
    reproduction: {
        baseDistance: 100,
        maxDistance: 180,
        maxChildren: 3
    }
};
