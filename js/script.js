/**
 * Subtle parallax movement for the floating shards + gentle glow drift.
 * Keeps the same “premium” motion feel as the screenshot (quiet, not gimmicky).
 */
(function () {
    const stage = document.getElementById('stage');
    const shards = Array.from(document.querySelectorAll('.shard'));
    const ring = document.querySelector('.search .ring');

    let mx = 0, my = 0;
    let tx = 0, ty = 0;
    let t = 0;

    function onMove(e) {
        // Safety check if stage exists
        if (!stage) return;

        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;   // 0..1
        const y = (e.clientY - r.top) / r.height;  // 0..1
        mx = (x - 0.5) * 2; // -1..1
        my = (y - 0.5) * 2;
    }

    if (stage) {
        stage.addEventListener('mousemove', onMove, { passive: true });
    }

    function animate() {
        // smooth follow
        tx += (mx - tx) * 0.06;
        ty += (my - ty) * 0.06;

        // animate shards
        shards.forEach(el => {
            const depth = Number(el.dataset.depth || 10);
            const dx = tx * depth;
            const dy = ty * depth * 0.7;
            el.style.transform = `${el.style.transform.split(' translate')[0]} translate(${dx}px, ${dy}px)`;
        });

        // gentle gradient drift
        if (ring) {
            t += 0.004;
            const drift = Math.sin(t) * 10;
            ring.style.opacity = (0.50 + (Math.sin(t * 1.7) + 1) * 0.06).toFixed(3);
            ring.style.transform = `translateX(${drift}px)`;
        }

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})();
