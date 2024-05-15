<script>
    import { onMount } from "svelte";

    let canvas, ctx;
    let nodes = [];

    function createNodes() {
        nodes = [];
        for (let i = 0; i < 100; i++) {
            nodes.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: Math.random() * 3 + 1,
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * 2 - 1,
            });
        }
    }

    function connectNodes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        nodes.forEach((node) => {
            node.x += node.speedX;
            node.y += node.speedY;

            // Wrap around the edges of the canvas
            if (node.x > window.innerWidth) node.x = 0;
            if (node.y > window.innerHeight) node.y = 0;
            if (node.x < 0) node.x = window.innerWidth;
            if (node.y < 0) node.y = window.innerHeight;

            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
            ctx.fill();
            // Connect to nearby nodes
            nodes.forEach((other) => {
                if (distance(node, other) < 150) {
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            });
        });
        requestAnimationFrame(connectNodes);
    }

    function distance(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    onMount(() => {
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.zIndex = "-1";
        createNodes();
        connectNodes();

        return () => {
            document.body.removeChild(canvas);
        };
    });
</script>

<style>
    canvas {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
    }
</style>
