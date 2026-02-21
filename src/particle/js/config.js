// ============================================================
// Three.js 3D 花朵配置
// ============================================================

const CONFIG = {
    // 场景配置
    scene: {
        backgroundColor: 0x87CEEB, // 天蓝色
        fogColor: 0x87CEEB,
        fogNear: 30,
        fogFar: 80
    },

    // 相机配置
    camera: {
        fov: 60,
        near: 0.1,
        far: 1000,
        position: { x: 0, y: 4, z: 10 }
    },

    // 渲染器配置
    renderer: {
        antialias: true,
        shadowMapEnabled: true,
        shadowMapType: 'PCFSoftShadowMap'
    },

    // 轨道控制配置
    controls: {
        enableDamping: true,
        dampingFactor: 0.05,
        minDistance: 4,
        maxDistance: 20,
        maxPolarAngle: Math.PI / 2 - 0.05
    },

    // 光源配置
    lights: {
        ambient: { color: 0xffffff, intensity: 0.5 }, // 白色环境光
        main: { color: 0xffffcc, intensity: 1.2, position: { x: 20, y: 30, z: 10 } }, // 暖阳光
        fill: { color: 0x88ccff, intensity: 0.3, position: { x: -15, y: 10, z: -10 } } // 冷填充光
    },

    // 地面配置
    ground: {
        radius: 20,
        segments: 64,
        color: 0x4a7c35,
        moundColor: 0x5a8c45,
        moundCount: 15,
        moundMinSize: 0.4,
        moundMaxSize: 0.8
    },

    // 草配置
    grass: {
        count: 600,
        radius: 16,
        baseHeight: 0.4,
        baseRadius: 0.06,
        segments: 4,
        color: 0x5aac5a,
        avoidanceRadius: 1.2
    },

    // 花朵配置（向日葵样式）
    flower: {
        stem: {
            baseHeight: 5,
            baseRadius: 0.12,
            segments: 20,
            radialSegments: 12,
            color: 0x5d8a3a,
            shininess: 30
        },
        petal: {
            layers: 2,
            innerCount: 18,
            outerCount: 24,
            innerLength: 1.2,
            outerLength: 1.8,
            innerWidth: 0.4,
            outerWidth: 0.5,
            baseColor: 0xffd700,
            tipColor: 0xffa500,
            shininess: 80
        },
        center: {
            radius: 0.8,
            seedCount: 200,
            seedRadius: 0.08,
            baseColor: 0x4a2c0a,
            seedColor: 0x2d1a05
        },
        leaf: {
            count: 4,
            baseLength: 2.2,  // 稍微缩小避免重叠
            baseWidth: 1.6,   // 稍微变窄避免重叠
            color: 0x3d7a2d,
            shininess: 40,
            positionY: [-2.8, -1.8, -0.8, 0.2],  // 调整位置间距
            angleSpread: 0.6  // 叶子展开角度
        }
    },

    // 动画配置
    animation: {
        baseSpeed: 1.0,
        minSpeed: 0.2,
        maxSpeed: 5.0,
        stemGrowthRate: 0.005,  // 降低生长速度
        bloomGrowthRate: 0.006,  // 降低绽放速度
        rotationSpeed: 0,          // 禁用整体旋转
        petalWaveSpeed: 0.3,      // 花瓣轻微摆动
        petalWaveAmplitude: 0.02, // 花瓣摆动幅度
        colorChangeSpeed: 0.1
    }
};
