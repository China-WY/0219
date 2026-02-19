// ============================================================
// Three.js 3D 花朵配置
// ============================================================

const CONFIG = {
    // 场景配置
    scene: {
        backgroundColor: 0x1a3a2a,
        fogColor: 0x1a3a2a,
        fogNear: 20,
        fogFar: 50
    },

    // 相机配置
    camera: {
        fov: 60,
        near: 0.1,
        far: 1000,
        position: { x: 0, y: 3, z: 8 }
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
        minDistance: 3,
        maxDistance: 15,
        maxPolarAngle: Math.PI / 2 - 0.1
    },

    // 光源配置
    lights: {
        ambient: { color: 0x4466aa, intensity: 0.4 },
        main: { color: 0xccddff, intensity: 0.8, position: { x: 15, y: 25, z: 15 } },
        fill: { color: 0x66ff66, intensity: 0.2, position: { x: -10, y: 5, z: -10 } }
    },

    // 地面配置
    ground: {
        radius: 15,
        segments: 64,
        color: 0x2d5a3d,
        moundColor: 0x3d6a4d,
        moundCount: 10,
        moundMinSize: 0.3,
        moundMaxSize: 0.7
    },

    // 草配置
    grass: {
        count: 500,
        radius: 12,
        baseHeight: 0.3,
        baseRadius: 0.05,
        segments: 3,
        color: 0x4a9a4a,
        avoidanceRadius: 0.8
    },

    // 花朵配置
    flower: {
        stem: {
            baseHeight: 4,
            baseRadius: 0.08,
            segments: 20,
            radialSegments: 8,
            color: 0x4a8a4a,
            shininess: 30
        },
        petal: {
            count: 8,
            baseLength: 2.5,
            baseWidth: 1.0,
            color: 0xff6666,
            shininess: 100,
            bevelThickness: 0.1,
            bevelSize: 0.1
        },
        center: {
            radius: 0.4,
            segments: 32,
            color: 0xffaa00,
            shininess: 80
        },
        leaf: {
            count: 2,
            baseLength: 2.0,
            baseWidth: 1.6,
            color: 0x44aa44,
            shininess: 50,
            positionY: -1.5
        }
    },

    // 星星配置
    stars: {
        count: 500,
        minRadius: 30,
        maxRadius: 80,
        baseY: 10,
        size: 0.15,
        opacity: 0.8
    },

    // 动画配置
    animation: {
        baseSpeed: 0.5,
        minSpeed: 0.1,
        maxSpeed: 3.0,
        stemGrowthRate: 0.002,
        bloomGrowthRate: 0.003,
        rotationSpeed: 0.002,
        colorChangeSpeed: 0.05
    }
};
