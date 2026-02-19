// ============================================================
// Canvas 2D 渲染器
// ============================================================

class FlowerRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }

    /**
     * 清空画布
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * 绘制背景
     */
    drawBackground(timeS) {
        // 绘制渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, CONFIG.background.topColor);
        gradient.addColorStop(1, CONFIG.background.bottomColor);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 绘制闪烁的星星
        for (let i = 0; i < CONFIG.background.starCount; i++) {
            const x = (i * 7919) % this.width;
            const y = (i * 6271) % this.height;
            const twinkle = Math.sin(timeS * 2 + i * 0.5) * 0.3 + 0.7;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.3})`;
            this.ctx.fill();
        }
    }

    /**
     * 绘制花茎（使用三次贝塞尔曲线模拟自然弯曲）
     */
    drawStem(flower) {
        const { baseX: x, baseY: y, stemLength, stemBend, growth } = flower;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);

        const segments = CONFIG.stem.segments * 2;  // 增加分段数

        // 使用三次贝塞尔曲线创建更自然的弯曲
        // 第一段：底部到中部
        const midY = y - stemLength * 0.5;
        const midX = x + Math.sin(Math.PI * 0.25) * stemBend * 0.4;
        const midCp1X = x + stemBend * 0.15;
        const midCp1Y = y - stemLength * 0.2;
        const midCp2X = x + stemBend * 0.3;
        const midCp2Y = midY - stemLength * 0.1;

        this.ctx.bezierCurveTo(midCp1X, midCp1Y, midCp2X, midCp2Y, midX, midY);

        // 第二段：中部到顶部
        const topY = y - stemLength;
        const topX = x + stemBend;
        const topCp1X = x + stemBend * 0.6;
        const topCp1Y = midY - stemLength * 0.15;
        const topCp2X = x + stemBend * 0.85;
        const topCp2Y = topY + stemLength * 0.1;

        this.ctx.bezierCurveTo(topCp1X, topCp1Y, topCp2X, topCp2Y, topX, topY);

        // 添加微小的S形波动增加自然感
        const gradient = this.ctx.createLinearGradient(x, y, x, y - stemLength);
        gradient.addColorStop(0, CONFIG.stem.baseColor);
        gradient.addColorStop(1, CONFIG.stem.topColor);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = CONFIG.stem.baseWidth + growth * (CONFIG.stem.maxWidth - CONFIG.stem.baseWidth);
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // 绘制花茎纹理（小横纹）
        if (growth > 0.3) {
            this.ctx.save();
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            this.ctx.lineWidth = 1;

            for (let i = 1; i < 8; i++) {
                const t = i / 8;
                // 使用三次贝塞尔曲线计算点
                const currentX = this.calculateBezierPoint(t, x, midCp1X, midCp2X, midX, topX, topCp1X, topCp2X);
                const currentY = this.calculateBezierPoint(t, y, midCp1Y, midCp2Y, midY, topY, topCp1Y, topCp2Y);

                this.ctx.beginPath();
                this.ctx.moveTo(currentX, currentY);
                this.ctx.lineTo(currentX + stemBend * 0.15, currentY);
                this.ctx.stroke();
            }
            this.ctx.restore();
        }
    }

    /**
     * 计算三次贝塞尔曲线上的点
     */
    calculateBezierPoint(t, x0, x1, x2, x3, x4, x5, x6) {
        // 第一段贝塞尔曲线 (t < 0.5)
        if (t < 0.5) {
            const localT = t * 2;
            const invT = 1 - localT;
            return Math.pow(invT, 3) * x0 +
                   3 * Math.pow(invT, 2) * localT * x1 +
                   3 * invT * Math.pow(localT, 2) * x2 +
                   Math.pow(localT, 3) * x3;
        }
        // 第二段贝塞尔曲线 (t >= 0.5)
        else {
            const localT = (t - 0.5) * 2;
            const invT = 1 - localT;
            return Math.pow(invT, 3) * x3 +
                   3 * Math.pow(invT, 2) * localT * x4 +
                   3 * invT * Math.pow(localT, 2) * x5 +
                   Math.pow(localT, 3) * x6;
        }
    }

    /**
     * 绘制叶片（使用三次贝塞尔曲线和波浪边缘，添加叶脉）
     */
    drawLeaves(flower) {
        const { baseX: x, baseY: y, stemLength, stemBend, leafCount, leafSize, leafAngle } = flower;
        const stemTopX = x + stemBend;
        const stemTopY = y - stemLength;

        for (let i = 0; i < leafCount; i++) {
            const side = i % 2 === 0 ? 1 : -1;
            const leafIndex = Math.floor(i / 2);
            const baseAngle = leafAngle * (leafIndex + 1) / (leafCount / 2 + 1);
            const angle = side * baseAngle;

            // 叶子根部和尖端位置
            const leafTipX = stemTopX + Math.cos(angle - Math.PI / 2) * leafSize * side;
            const leafTipY = stemTopY + Math.sin(angle - Math.PI / 2) * leafSize;

            // 波浪参数
            const waveFreq = 3;
            const waveAmp = leafSize * 0.1;

            this.ctx.beginPath();
            this.ctx.moveTo(stemTopX, stemTopY);

            // 左侧边缘 - 带波浪
            const segments = 5;
            for (let s = 0; s <= segments; s++) {
                const t = s / segments;
                const progress = Math.pow(t, 0.7); // 非线性分布，靠近尖端更密集

                const edgeX = stemTopX + (leafTipX - stemTopX) * progress;
                const edgeY = stemTopY + (leafTipY - stemTopY) * progress;

                // 计算垂直于叶片方向的波浪偏移
                const perpendicularAngle = angle;
                const waveOffset = Math.sin(t * Math.PI * waveFreq) * waveAmp * (1 - t * 0.5);

                const waveX = edgeX + Math.cos(perpendicularAngle) * waveOffset;
                const waveY = edgeY + Math.sin(perpendicularAngle) * waveOffset;

                if (s === 0) {
                    this.ctx.lineTo(waveX, waveY);
                } else {
                    // 使用三次贝塞尔曲线平滑连接
                    const prevT = (s - 1) / segments;
                    const prevProgress = Math.pow(prevT, 0.7);
                    const prevEdgeX = stemTopX + (leafTipX - stemTopX) * prevProgress;
                    const prevEdgeY = stemTopY + (leafTipY - stemTopY) * prevProgress;
                    const prevWaveOffset = Math.sin(prevT * Math.PI * waveFreq) * waveAmp * (1 - prevT * 0.5);
                    const prevWaveX = prevEdgeX + Math.cos(perpendicularAngle) * prevWaveOffset;
                    const prevWaveY = prevEdgeY + Math.sin(perpendicularAngle) * prevWaveOffset;

                    // 控制点1
                    const cp1X = (prevWaveX + waveX) / 2 + Math.cos(angle) * leafSize * 0.15;
                    const cp1Y = (prevWaveY + waveY) / 2 + Math.sin(angle) * leafSize * 0.15;
                    // 控制点2
                    const cp2X = (prevWaveX + waveX) / 2 - Math.cos(angle) * leafSize * 0.05;
                    const cp2Y = (prevWaveY + waveY) / 2 - Math.sin(angle) * leafSize * 0.05;

                    this.ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, waveX, waveY);
                }
            }

            // 右侧边缘 - 镜像波浪（相位偏移π）
            for (let s = segments; s >= 0; s--) {
                const t = s / segments;
                const progress = Math.pow(t, 0.7);

                const edgeX = stemTopX + (leafTipX - stemTopX) * progress;
                const edgeY = stemTopY + (leafTipY - stemTopY) * progress;

                const perpendicularAngle = angle + Math.PI;
                const waveOffset = Math.sin(t * Math.PI * waveFreq + Math.PI) * waveAmp * (1 - t * 0.5);

                const waveX = edgeX + Math.cos(perpendicularAngle) * waveOffset;
                const waveY = edgeY + Math.sin(perpendicularAngle) * waveOffset;

                if (s === segments) {
                    // 使用三次贝塞尔曲线连接到尖端
                    const cp1X = (stemTopX + leafTipX) / 2 + Math.cos(angle + 0.3) * leafSize * 0.2;
                    const cp1Y = (stemTopY + leafTipY) / 2 + Math.sin(angle + 0.3) * leafSize * 0.2;
                    const cp2X = (stemTopX + leafTipX) / 2 + Math.cos(angle - 0.1) * leafSize * 0.1;
                    const cp2Y = (stemTopY + leafTipY) / 2 + Math.sin(angle - 0.1) * leafSize * 0.1;

                    this.ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, waveX, waveY);
                } else {
                    const nextT = (s + 1) / segments;
                    const nextProgress = Math.pow(nextT, 0.7);
                    const nextEdgeX = stemTopX + (leafTipX - stemTopX) * nextProgress;
                    const nextEdgeY = stemTopY + (leafTipY - stemTopY) * nextProgress;
                    const nextWaveOffset = Math.sin(nextT * Math.PI * waveFreq + Math.PI) * waveAmp * (1 - nextT * 0.5);
                    const nextWaveX = nextEdgeX + Math.cos(perpendicularAngle) * nextWaveOffset;
                    const nextWaveY = nextEdgeY + Math.sin(perpendicularAngle) * nextWaveOffset;

                    const cp1X = (nextWaveX + waveX) / 2 + Math.cos(angle) * leafSize * 0.15;
                    const cp1Y = (nextWaveY + waveY) / 2 + Math.sin(angle) * leafSize * 0.15;
                    const cp2X = (nextWaveX + waveX) / 2 - Math.cos(angle) * leafSize * 0.05;
                    const cp2Y = (nextWaveY + waveY) / 2 - Math.sin(angle) * leafSize * 0.05;

                    this.ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, waveX, waveY);
                }
            }

            this.ctx.closePath();

            const leafGradient = this.ctx.createLinearGradient(stemTopX, stemTopY, leafTipX, leafTipY);
            leafGradient.addColorStop(0, CONFIG.leaf.baseColor);
            leafGradient.addColorStop(1, CONFIG.leaf.topColor);
            this.ctx.fillStyle = leafGradient;
            this.ctx.fill();

            // 绘制叶脉
            this.ctx.save();
            this.ctx.strokeStyle = 'rgba(0, 50, 0, 0.15)';
            this.ctx.lineWidth = 1;

            // 主叶脉（从根部到尖端的曲线）
            this.ctx.beginPath();
            this.ctx.moveTo(stemTopX, stemTopY);
            const mainVeinTipX = stemTopX + (leafTipX - stemTopX) * 0.9;
            const mainVeinTipY = stemTopY + (leafTipY - stemTopY) * 0.9;
            const mainVeinCpX = (stemTopX + mainVeinTipX) / 2 + Math.cos(angle + Math.PI / 2) * leafSize * 0.05;
            const mainVeinCpY = (stemTopY + mainVeinTipY) / 2 + Math.sin(angle + Math.PI / 2) * leafSize * 0.05;
            this.ctx.quadraticCurveTo(mainVeinCpX, mainVeinCpY, mainVeinTipX, mainVeinTipY);
            this.ctx.stroke();

            // 侧叶脉（分叉）
            const sideVeinCount = 3;
            for (let sv = 0; sv < sideVeinCount; sv++) {
                const baseProgress = 0.3 + sv * 0.2;
                const baseX = stemTopX + (leafTipX - stemTopX) * baseProgress;
                const baseY = stemTopY + (leafTipY - stemTopY) * baseProgress;

                // 左侧侧脉
                this.ctx.beginPath();
                this.ctx.moveTo(baseX, baseY);
                const leftEndX = baseX + Math.cos(angle - Math.PI / 2 - sv * 0.3) * leafSize * 0.2;
                const leftEndY = baseY + Math.sin(angle - Math.PI / 2 - sv * 0.3) * leafSize * 0.2;
                this.ctx.quadraticCurveTo(
                    (baseX + leftEndX) / 2,
                    (baseY + leftEndY) / 2 - leafSize * 0.05,
                    leftEndX, leftEndY
                );
                this.ctx.stroke();

                // 右侧侧脉
                this.ctx.beginPath();
                this.ctx.moveTo(baseX, baseY);
                const rightEndX = baseX + Math.cos(angle + Math.PI / 2 + sv * 0.3) * leafSize * 0.2;
                const rightEndY = baseY + Math.sin(angle + Math.PI / 2 + sv * 0.3) * leafSize * 0.2;
                this.ctx.quadraticCurveTo(
                    (baseX + rightEndX) / 2,
                    (baseY + rightEndY) / 2 - leafSize * 0.05,
                    rightEndX, rightEndY
                );
                this.ctx.stroke();
            }

            this.ctx.restore();
        }
    }

    /**
     * 绘制花瓣（使用三次贝塞尔曲线和波浪边缘）
     */
    drawPetals(flower) {
        const { baseX: x, baseY: y, stemLength, stemBend, petalCount, petalLength, petalWidth, petalSpread } = flower;
        const flowerCenterX = x + stemBend;
        const flowerCenterY = y - stemLength;

        for (let i = 0; i < petalCount; i++) {
            const baseAngle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
            const spreadOffset = petalSpread * 0.5 * (i % 2 === 0 ? 1 : -1) * 0.3;
            const petalAngle = baseAngle + spreadOffset;

            // 计算花瓣尖端
            const tipX = flowerCenterX + Math.cos(petalAngle) * petalLength;
            const tipY = flowerCenterY + Math.sin(petalAngle) * petalLength;

            // 计算左边缘波浪点
            const waveFreq = 3;  // 波浪频率
            const waveAmp = petalWidth * 0.15;  // 波浪幅度

            this.ctx.beginPath();
            this.ctx.moveTo(flowerCenterX, flowerCenterY);

            // 左侧边缘 - 使用多个三次贝塞尔曲线创建波浪
            const leftSegments = 4;
            for (let s = 0; s <= leftSegments; s++) {
                const t = s / leftSegments;
                const baseX = flowerCenterX + Math.cos(petalAngle - 0.3 - t * 0.3) * petalWidth * t;
                const baseY = flowerCenterY + Math.sin(petalAngle - 0.3 - t * 0.3) * petalWidth * t * 0.6;

                // 添加波浪偏移
                const waveOffset = Math.sin(t * Math.PI * waveFreq) * waveAmp * (1 - t);
                const waveX = baseX + Math.cos(petalAngle - Math.PI / 2) * waveOffset;
                const waveY = baseY + Math.sin(petalAngle - Math.PI / 2) * waveOffset;

                if (s === 0) {
                    this.ctx.lineTo(waveX, waveY);
                } else {
                    // 使用三次贝塞尔曲线平滑连接
                    const prevT = (s - 1) / leftSegments;
                    const prevBaseX = flowerCenterX + Math.cos(petalAngle - 0.3 - prevT * 0.3) * petalWidth * prevT;
                    const prevBaseY = flowerCenterY + Math.sin(petalAngle - 0.3 - prevT * 0.3) * petalWidth * prevT * 0.6;
                    const prevWaveOffset = Math.sin(prevT * Math.PI * waveFreq) * waveAmp * (1 - prevT);
                    const prevWaveX = prevBaseX + Math.cos(petalAngle - Math.PI / 2) * prevWaveOffset;
                    const prevWaveY = prevBaseY + Math.sin(petalAngle - Math.PI / 2) * prevWaveOffset;

                    const cp1X = (prevWaveX + waveX) / 2 + Math.cos(petalAngle) * petalLength * 0.1;
                    const cp1Y = (prevWaveY + waveY) / 2 + Math.sin(petalAngle) * petalLength * 0.1;
                    const cp2X = (prevWaveX + waveX) / 2 - Math.cos(petalAngle) * petalLength * 0.05;
                    const cp2Y = (prevWaveY + waveY) / 2 - Math.sin(petalAngle) * petalLength * 0.05;

                    this.ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, waveX, waveY);
                }
            }

            // 连接到花瓣尖端
            this.ctx.bezierCurveTo(
                flowerCenterX + Math.cos(petalAngle - 0.2) * petalLength * 0.9,
                flowerCenterY + Math.sin(petalAngle - 0.2) * petalLength * 0.9,
                flowerCenterX + Math.cos(petalAngle - 0.1) * petalLength * 0.95,
                flowerCenterY + Math.sin(petalAngle - 0.1) * petalLength * 0.95,
                tipX, tipY
            );

            // 右侧边缘 - 镜像波浪
            for (let s = leftSegments; s >= 0; s--) {
                const t = s / leftSegments;
                const baseX = flowerCenterX + Math.cos(petalAngle + 0.3 + t * 0.3) * petalWidth * t;
                const baseY = flowerCenterY + Math.sin(petalAngle + 0.3 + t * 0.3) * petalWidth * t * 0.6;

                const waveOffset = Math.sin(t * Math.PI * waveFreq + Math.PI) * waveAmp * (1 - t);
                const waveX = baseX + Math.cos(petalAngle - Math.PI / 2) * waveOffset;
                const waveY = baseY + Math.sin(petalAngle - Math.PI / 2) * waveOffset;

                if (s === leftSegments) {
                    this.ctx.bezierCurveTo(
                        flowerCenterX + Math.cos(petalAngle + 0.1) * petalLength * 0.95,
                        flowerCenterY + Math.sin(petalAngle + 0.1) * petalLength * 0.95,
                        flowerCenterX + Math.cos(petalAngle + 0.2) * petalLength * 0.9,
                        flowerCenterY + Math.sin(petalAngle + 0.2) * petalLength * 0.9,
                        waveX, waveY
                    );
                } else {
                    const nextT = (s + 1) / leftSegments;
                    const nextBaseX = flowerCenterX + Math.cos(petalAngle + 0.3 + nextT * 0.3) * petalWidth * nextT;
                    const nextBaseY = flowerCenterY + Math.sin(petalAngle + 0.3 + nextT * 0.3) * petalWidth * nextT * 0.6;
                    const nextWaveOffset = Math.sin(nextT * Math.PI * waveFreq + Math.PI) * waveAmp * (1 - nextT);
                    const nextWaveX = nextBaseX + Math.cos(petalAngle - Math.PI / 2) * nextWaveOffset;
                    const nextWaveY = nextBaseY + Math.sin(petalAngle - Math.PI / 2) * nextWaveOffset;

                    const cp1X = (nextWaveX + waveX) / 2 + Math.cos(petalAngle) * petalLength * 0.1;
                    const cp1Y = (nextWaveY + waveY) / 2 + Math.sin(petalAngle) * petalLength * 0.1;
                    const cp2X = (nextWaveX + waveX) / 2 - Math.cos(petalAngle) * petalLength * 0.05;
                    const cp2Y = (nextWaveY + waveY) / 2 - Math.sin(petalAngle) * petalLength * 0.05;

                    this.ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, waveX, waveY);
                }
            }

            this.ctx.closePath();

            const petalGradient = this.ctx.createRadialGradient(
                flowerCenterX, flowerCenterY, 0,
                flowerCenterX, flowerCenterY, petalLength
            );
            petalGradient.addColorStop(0, CONFIG.petal.baseColor);
            petalGradient.addColorStop(1, CONFIG.petal.topColor);
            this.ctx.fillStyle = petalGradient;
            this.ctx.fill();
        }
    }

    /**
     * 绘制花蕊
     */
    drawPistil(flower) {
        const { baseX: x, baseY: y, stemLength, stemBend, pistilRadius, stamenCount, growth } = flower;
        const flowerCenterX = x + stemBend;
        const flowerCenterY = y - stemLength;

        // 花蕊主体
        this.ctx.beginPath();
        this.ctx.arc(flowerCenterX, flowerCenterY, pistilRadius, 0, Math.PI * 2);
        const pistilGradient = this.ctx.createRadialGradient(
            flowerCenterX, flowerCenterY, 0,
            flowerCenterX, flowerCenterY, pistilRadius
        );
        pistilGradient.addColorStop(0, CONFIG.pistil.baseColor);
        pistilGradient.addColorStop(1, CONFIG.pistil.topColor);
        this.ctx.fillStyle = pistilGradient;
        this.ctx.fill();

        // 雄蕊
        for (let i = 0; i < stamenCount; i++) {
            const angle = (i / stamenCount) * Math.PI * 2;
            const length = pistilRadius * 0.8 + growth * pistilRadius * 0.5;
            const sx = flowerCenterX + Math.cos(angle) * length;
            const sy = flowerCenterY + Math.sin(angle) * length;

            this.ctx.beginPath();
            this.ctx.moveTo(flowerCenterX, flowerCenterY);
            this.ctx.lineTo(sx, sy);
            this.ctx.strokeStyle = CONFIG.stamen.color;
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(sx, sy, 2 + growth, 0, Math.PI * 2);
            this.ctx.fillStyle = CONFIG.stamen.tipColor;
            this.ctx.fill();
        }
    }

    /**
     * 绘制完整花朵
     */
    drawFlower(flowerData) {
        this.drawStem(flowerData);
        this.drawLeaves(flowerData);
        this.drawPetals(flowerData);
        this.drawPistil(flowerData);
    }

    /**
     * 更新画布尺寸
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
    }
}
