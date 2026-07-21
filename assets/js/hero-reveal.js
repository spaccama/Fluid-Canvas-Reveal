(function () {
  function heroFluidSketch(container) {
    return function (p) {
      
      const baseUrl = container.getAttribute('data-base');
      const revealUrl = container.getAttribute('data-reveal');
      const outlinesUrl = container.getAttribute('data-outlines');

      const blur = 8;
      const blobRadius = 110;
      const spacing = 18;
      const lifespan = 2200;
      const elongation = 2.8;

      const VERTS = 28;

      let imgBase, imgReveal, imgOutlines;
      let trail = [];
      let maskBuffer, patternBuffer, patternMaskedBuffer;
      let baseMaskedBuffer, helmetMaskedBuffer, outlinesMaskedBuffer;
      let scannerMaskBuffer;
      let w, h;

      let lastPointerX = null, lastPointerY = null;

      
      let scannerY = 0;

      p.preload = function () {
        if (baseUrl) imgBase = p.loadImage(baseUrl);
        if (revealUrl) imgReveal = p.loadImage(revealUrl);
        if (outlinesUrl) imgOutlines = p.loadImage(outlinesUrl);
      };

      function makeBuffers() {
        maskBuffer = p.createGraphics(w, h);
        maskBuffer.pixelDensity(1);
        maskBuffer.noStroke();
        maskBuffer.fill(255);

        patternBuffer = p.createGraphics(w, h);
        patternBuffer.pixelDensity(1);

        patternMaskedBuffer = p.createGraphics(w, h);
        patternMaskedBuffer.pixelDensity(1);

        baseMaskedBuffer = p.createGraphics(w, h);
        baseMaskedBuffer.pixelDensity(1);

        helmetMaskedBuffer = p.createGraphics(w, h);
        helmetMaskedBuffer.pixelDensity(1);

        outlinesMaskedBuffer = p.createGraphics(w, h);
        outlinesMaskedBuffer.pixelDensity(1);

        scannerMaskBuffer = p.createGraphics(w, h);
        scannerMaskBuffer.pixelDensity(1);
      }

      p.setup = function () {
        w = container.offsetWidth || window.innerWidth;
        h = container.offsetHeight || window.innerHeight;

        const cnv = p.createCanvas(w, h);
        cnv.parent(container);
        cnv.addClass('hero-reveal__canvas');
        p.pixelDensity(1);

        makeBuffers();
        p.loop();
      };

      p.windowResized = function () {
        w = container.offsetWidth || window.innerWidth;
        h = container.offsetHeight || window.innerHeight;
        p.resizeCanvas(w, h);
        makeBuffers();
      };

      function addTrailPoint(x, y, angle) {
        trail.push({
          x, y, angle: angle || 0,
          bornAt: performance.now(),
          seed: p.random(1000),
        });
      }

      function handlePointer(x, y) {
        if (lastPointerX === null) {
          lastPointerX = x;
          lastPointerY = y;
          return;
        }

        const dx = x - lastPointerX;
        const dy = y - lastPointerY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        if (dist >= spacing) {
          const steps = Math.floor(dist / spacing);
          for (let i = 1; i <= steps; i++) {
            const t = (i * spacing) / dist;
            addTrailPoint(lastPointerX + dx * t, lastPointerY + dy * t, angle);
          }
          lastPointerX = x;
          lastPointerY = y;
        }
      }

      container.addEventListener('pointermove', function (e) {
        const rect = container.getBoundingClientRect();
        handlePointer(e.clientX - rect.left, e.clientY - rect.top);
      }, { passive: true });

      container.addEventListener('pointerleave', function () {
        lastPointerX = null;
        lastPointerY = null;
      });

      function drawFluidPattern(t) {
        patternBuffer.background(255);
        patternBuffer.noStroke();

        const centers = [
          { x: w * 0.30, y: h * 0.40, seed: 12 },
          { x: w * 0.75, y: h * 0.30, seed: 48 },
          { x: w * 0.55, y: h * 0.75, seed: 85 }
        ];

        centers.forEach((center) => {
          const steps = 9;
          const maxRadius = Math.min(w, h) * 0.38;

          for (let i = steps; i >= 1; i--) {
            const rBase = (i / steps) * maxRadius;
            const shade = (i % 2 === 0) ? 244 : 228;
            patternBuffer.fill(shade);

            patternBuffer.beginShape();
            const numPts = 32;
            for (let j = 0; j <= numPts + 3; j++) {
              const idx = j % numPts;
              const a = (idx / numPts) * p.TWO_PI;

              const n = p.noise(
                center.seed + Math.cos(a) * 1.4,
                center.seed + Math.sin(a) * 1.4,
                t * 0.2 + i * 0.1
              );

              const r = rBase * (0.7 + n * 0.55);
              const x = center.x + Math.cos(a) * r;
              const y = center.y + Math.sin(a) * r;

              patternBuffer.curveVertex(x, y);
            }
            patternBuffer.endShape(p.CLOSE);
          }
        });
      }

      function organicPoints(radius, t, seed) {
        const pts = [];
        for (let i = 0; i < VERTS; i++) {
          const a = (i / VERTS) * p.TWO_PI;

          const n1 = p.noise(
            seed + Math.cos(a) * 2.2 + 5,
            seed + Math.sin(a) * 2.2 + 5,
            t
          );

          const n2 = p.noise(
            seed + Math.cos(a) * 0.8 + 100,
            seed + Math.sin(a) * 0.8 + 100,
            t * 0.5
          );

          const rad = radius * (0.4 + n1 * 0.6 + n2 * 0.3);
          pts.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad });
        }
        return pts;
      }

      function drawOrganicBlob(pg, x, y, angle, stretchX, pts) {
        pg.push();
        pg.translate(x, y);
        pg.rotate(angle);
        pg.scale(stretchX, 1);
        pg.beginShape();
        pg.curveVertex(pts[pts.length - 1].x, pts[pts.length - 1].y);
        for (const pt of pts) pg.curveVertex(pt.x, pt.y);
        pg.curveVertex(pts[0].x, pts[0].y);
        pg.curveVertex(pts[1].x, pts[1].y);
        pg.endShape(p.CLOSE);
        pg.pop();
      }

      p.draw = function () {
        const now = performance.now();
        const timeSec = now * 0.001;

        
        const speedNoise = p.noise(timeSec * 1.8);
        const currentSpeed = p.map(speedNoise, 0, 1, 8.0, 15.0);

       
        const scannerHeight = 180;
        const loopSpacing = h * 0.55;

        scannerY += currentSpeed;
        if (scannerY > h + scannerHeight + loopSpacing) {
          scannerY = scannerY - loopSpacing;
        }

        
        drawFluidPattern(timeSec);

        
        trail = trail.filter((pt) => now - pt.bornAt < lifespan);
        maskBuffer.clear();

        for (const pt of trail) {
          const age = now - pt.bornAt;
          const lifeRatio = age / lifespan;
          const sizeFactor = Math.pow(Math.sin(Math.PI * Math.min(1, lifeRatio)), 0.5);
          const r = blobRadius * sizeFactor;

          if (r < 1) continue;

          const pts = organicPoints(r, timeSec, pt.seed);
          drawOrganicBlob(maskBuffer, pt.x, pt.y, pt.angle, elongation, pts);
        }

        if (blur > 0) {
          maskBuffer.filter(p.BLUR, blur / 10);
        }

        
        scannerMaskBuffer.clear();
        scannerMaskBuffer.noStroke();
        scannerMaskBuffer.fill(255);

        function drawDiagonalScanner(baseY) {
          const skew = w * 0.25;
          const nTop = p.map(p.noise(baseY * 0.01, timeSec), 0, 1, -8, 8);
          const nBot = p.map(p.noise((baseY + 100) * 0.01, timeSec * 1.2), 0, 1, -8, 8);

          scannerMaskBuffer.beginShape();
          scannerMaskBuffer.vertex(0, baseY - scannerHeight + nTop);
          scannerMaskBuffer.vertex(w, baseY - scannerHeight - skew + nTop);
          scannerMaskBuffer.vertex(w, baseY - skew + nBot);
          scannerMaskBuffer.vertex(0, baseY + nBot);
          scannerMaskBuffer.endShape(p.CLOSE);
        }

        drawDiagonalScanner(scannerY);
        drawDiagonalScanner(scannerY - loopSpacing);
        drawDiagonalScanner(scannerY - (loopSpacing * 2));

        

        p.background(255);

        
        patternMaskedBuffer.clear();
        patternMaskedBuffer.image(patternBuffer, 0, 0, w, h);
        patternMaskedBuffer.drawingContext.globalCompositeOperation = 'destination-in';
        patternMaskedBuffer.image(maskBuffer, 0, 0, w, h);
        patternMaskedBuffer.drawingContext.globalCompositeOperation = 'source-over';

        p.image(patternMaskedBuffer, 0, 0, w, h);

       
        if (imgBase) {
          baseMaskedBuffer.clear();
          baseMaskedBuffer.image(imgBase, 0, 0, w, h);
          baseMaskedBuffer.drawingContext.globalCompositeOperation = 'destination-out';
          baseMaskedBuffer.image(maskBuffer, 0, 0, w, h);
          baseMaskedBuffer.drawingContext.globalCompositeOperation = 'source-over';

          p.image(baseMaskedBuffer, 0, 0, w, h);
        }

        if (imgReveal) {
          helmetMaskedBuffer.clear();
          helmetMaskedBuffer.image(imgReveal, 0, 0, w, h);
          helmetMaskedBuffer.drawingContext.globalCompositeOperation = 'destination-in';
          helmetMaskedBuffer.image(maskBuffer, 0, 0, w, h);
          helmetMaskedBuffer.drawingContext.globalCompositeOperation = 'source-over';

          p.image(helmetMaskedBuffer, 0, 0, w, h);
        }

        if (imgOutlines) {
          outlinesMaskedBuffer.clear();
          outlinesMaskedBuffer.image(imgOutlines, 0, 0, w, h);

          outlinesMaskedBuffer.drawingContext.globalCompositeOperation = 'destination-in';
          outlinesMaskedBuffer.image(scannerMaskBuffer, 0, 0, w, h);

          outlinesMaskedBuffer.drawingContext.globalCompositeOperation = 'destination-out';
          outlinesMaskedBuffer.image(maskBuffer, 0, 0, w, h);

          outlinesMaskedBuffer.drawingContext.globalCompositeOperation = 'source-over';

          p.image(outlinesMaskedBuffer, 0, 0, w, h);
        }
      };
    };
  }

  function initSketches() {
    document.querySelectorAll('.hero-reveal').forEach(function (container) {
      if (!container.dataset.initialized) {
        container.dataset.initialized = 'true';
        new p5(heroFluidSketch(container));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSketches);
  } else {
    initSketches();
  }
})();
