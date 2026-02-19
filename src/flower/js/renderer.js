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
     * 绘制花茎
     */
    drawStem(flower) {
        const { baseX: x, baseY: y, stemLength, stemBend, growth } = flower;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);

        const segments = CONFIG.stem.segments;
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const segY = y - stemLength * t;
            const segX = x + Math.sin(t * Math.PI) * stemBend * t;
            this.ctx.lineTo(segX, segY);
        }

        const gradient = this.ctx.createLinearGradient(x, y, x, y - stemLength);
        gradient.addColorStop(0, CONFIG.stem.baseColor);
        gradient.addColorStop(1, CONFIG.stem.topColor);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = CONFIG.stem.baseWidth + growth * (CONFIG.stem.maxWidth - CONFIG.stem.baseWidth);
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    }

    /**
     * 绘制叶片
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

            const leafTipX = stemTopX + Math.cos(angle - Math.PI / 2) * leafSize * side;
            const leafTipY = stemTopY + Math.sin(angle - Math.PI / 2) * leafSize;

            this.ctx.beginPath();
            this.ctx.moveTo(stemTopX, stemTopY);

            const cpX = stemTopX + Math.cos(angle - Math.PI / 2) * leafSize * 0.5 * side + leafSize * 0.3 * side;
            const cpY = stemTopY + Math.sin(angle - Math.PI / 2) * leafSize * 0.5;

            this.ctx.quadraticCurveTo(cpX, cpY, leafTipX, leafTipY);
            this.ctx.quadraticCurveTo(cpX - leafSize * 0.3 * side, stemTopY + Math.sin(angle - Math.PI / 2) * leafSize * 0.3, stemTopX, stemTopY);

            const leafGradient = this.ctx.createLinearGradient(stemTopX, stemTopY, leafTipX, leafTipY);
            leafGradient.addColorStop(0, CONFIG.leaf.baseColor);
            leafGradient.addColorStop(1, CONFIG.leaf.topColor);
            this.ctx.fillStyle = leafGradient;
            this.ctx.fill();
        }
    }

    /**
     * 绘制花瓣
     */
    drawPetals(flower) {
        const { baseX: x, baseY: y, stemLength, stemBend, petalCount, petalLength, petalWidth, petalSpread } = flower;
        const flowerCenterX = x + stemBend;
        const flowerCenterY = y - stemLength;

        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
            const tipX = flowerCenterX + Math.cos(angle) * petalLength;
            const tipY = flowerCenterY + Math.sin(angle) * petalLength;

            const spreadAngle = petalSpread * 0.5;
            const petalAngle = angle + spreadAngle * (i % 2 === 0 ? 1 : -1) * 0.3;

            const p1x = flowerCenterX + Math.cos(petalAngle - 0.3) * petalWidth;
            const p1y = flowerCenterY + Math.sin(petalAngle - 0.3) * petalWidth * 0.5;
            const p2x = flowerCenterX + Math.cos(petalAngle) * petalLength * 0.7;
            const p2y = flowerCenterY + Math.sin(petalAngle) * petalLength * 0.7;

            this.ctx.beginPath();
            this.ctx.moveTo(flowerCenterX, flowerCenterY);
            this.ctx.quadraticCurveTo(p1x, p1y, tipX, tipY);
            this.ctx.quadraticCurveTo(p2x, p2y, flowerCenterX, flowerCenterY);

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
