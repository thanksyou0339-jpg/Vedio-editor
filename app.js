(() => {

    "use strict";

    // =========================
    // ELEMENTS
    // =========================

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const imageInput = document.getElementById("imageInput");

    const productName = document.getElementById("productName");
    const price = document.getElementById("price");
    const delivery = document.getElementById("delivery");
    const brand = document.getElementById("brand");
    const description = document.getElementById("description");
    const orderLink = document.getElementById("orderLink");

    const durationInput = document.getElementById("duration");

    const nameAnimation = document.getElementById("nameAnimation");
    const priceAnimation = document.getElementById("priceAnimation");
    const deliveryAnimation = document.getElementById("deliveryAnimation");
    const brandAnimation = document.getElementById("brandAnimation");

    const previewBtn = document.getElementById("previewBtn");
    const createBtn = document.getElementById("createBtn");
    const stopBtn = document.getElementById("stopBtn");
    const resetBtn = document.getElementById("resetBtn");

    const statusBox = document.getElementById("status");
    const downloadLink = document.getElementById("downloadLink");

    // =========================
    // VARIABLES
    // =========================

    let productImage = null;

    let animationFrame = null;

    let previewRunning = false;

    let recording = false;

    let recorder = null;

    let recordedChunks = [];

    let videoUrl = null;

    // =========================
    // HELPERS
    // =========================

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function easeInOut(t) {
        return t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function setStatus(text) {
        statusBox.textContent = text;
    }

    function roundedRect(ctx, x, y, w, h, r) {

        r = Math.min(r, w / 2, h / 2);

        ctx.beginPath();

        ctx.moveTo(x + r, y);

        ctx.lineTo(x + w - r, y);

        ctx.quadraticCurveTo(
            x + w,
            y,
            x + w,
            y + r
        );

        ctx.lineTo(x + w, y + h - r);

        ctx.quadraticCurveTo(
            x + w,
            y + h,
            x + w - r,
            y + h
        );

        ctx.lineTo(x + r, y + h);

        ctx.quadraticCurveTo(
            x,
            y + h,
            x,
            y + h - r
        );

        ctx.lineTo(x, y + r);

        ctx.quadraticCurveTo(
            x,
            y,
            x + r,
            y
        );

        ctx.closePath();
    }

    function wrapText(text, maxWidth, fontSize) {

        ctx.font = `bold ${fontSize}px Arial`;

        const words = String(text || "").split(/\s+/);

        const lines = [];

        let current = "";

        for (const word of words) {

            const test = current
                ? current + " " + word
                : word;

            if (ctx.measureText(test).width <= maxWidth) {
                current = test;
            } else {

                if (current) {
                    lines.push(current);
                }

                current = word;
            }
        }

        if (current) {
            lines.push(current);
        }

        return lines;
    }

    // =========================
    // IMAGE LOAD
    // =========================

    imageInput.addEventListener("change", function () {

        const file = this.files && this.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {

            setStatus("یہ image file نہیں ہے۔");

            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            const img = new Image();

            img.onload = function () {

                productImage = img;

                setStatus(
                    "✅ Product image successfully loaded."
                );

                renderFrame(0);
            };

            img.onerror = function () {

                setStatus(
                    "❌ Image load نہیں ہو سکی۔"
                );

            };

            img.src = event.target.result;
        };

        reader.onerror = function () {

            setStatus(
                "❌ File read نہیں ہو سکی۔"
            );

        };

        reader.readAsDataURL(file);

    });

    // =========================
    // ANIMATION CALCULATION
    // =========================

    function getAnimation(type, progress) {

        let x = 0;
        let y = 0;
        let scale = 1;
        let rotation = 0;
        let opacity = 1;

        const p = clamp(progress, 0, 1);

        switch (type) {

            case "static":

                break;

            case "slideLeft":

                x = 500 * (1 - easeOut(p));

                break;

            case "slideRight":

                x = -500 * (1 - easeOut(p));

                break;

            case "slideUp":

                y = 400 * (1 - easeOut(p));

                break;

            case "slideDown":

                y = -400 * (1 - easeOut(p));

                break;

            case "zoom":

                scale = 0.15 + 0.85 * easeOut(p);

                break;

            case "bounce": {

                const bounce =
                    Math.abs(Math.sin(p * Math.PI * 3))
                    * (1 - p);

                y = -35 * bounce;

                break;
            }

            case "spin":

                rotation = p * Math.PI * 2;

                scale = 0.7 + 0.3 * easeOut(p);

                break;

            case "orbit": {

                // Satellite-style elliptical movement

                const angle =
                    p * Math.PI * 2;

                x = Math.cos(angle) * 115;

                y = Math.sin(angle) * 32;

                const perspective =
                    (Math.sin(angle) + 1) / 2;

                scale =
                    0.72 +
                    perspective * 0.35;

                rotation =
                    angle + Math.PI / 2;

                opacity =
                    0.55 +
                    perspective * 0.45;

                break;
            }

            case "float":

                y =
                    Math.sin(p * Math.PI * 4)
                    * 22;

                rotation =
                    Math.sin(p * Math.PI * 2)
                    * 0.04;

                break;

            case "shake":

                x =
                    Math.sin(p * Math.PI * 20)
                    * 12
                    * (1 - p);

                rotation =
                    Math.sin(p * Math.PI * 16)
                    * 0.06
                    * (1 - p);

                break;

            case "pop": {

                if (p < 0.7) {

                    const q = p / 0.7;

                    scale =
                        0.1 +
                        easeOut(q) * 1.08;

                } else {

                    const q =
                        (p - 0.7) / 0.3;

                    scale =
                        1.08 -
                        q * 0.08;
                }

                break;
            }

            case "fade":

                opacity = easeOut(p);

                break;
        }

        return {
            x,
            y,
            scale,
            rotation,
            opacity
        };
    }

    // =========================
    // DRAW TEXT
    // =========================

    function drawAnimatedText(
        text,
        x,
        y,
        fontSize,
        animation,
        progress,
        fill,
        maxWidth
    ) {

        if (!text) {
            return;
        }

        const a = getAnimation(
            animation,
            progress
        );

        ctx.save();

        ctx.translate(
            x + a.x,
            y + a.y
        );

        ctx.rotate(a.rotation);

        ctx.scale(
            a.scale,
            a.scale
        );

        ctx.globalAlpha =
            clamp(a.opacity, 0, 1);

        ctx.direction = "rtl";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.font =
            `bold ${fontSize}px Arial`;

        // Glow / shadow

        if (
            animation === "glow" ||
            animation === "orbit"
        ) {

            ctx.shadowBlur = 22;

            ctx.shadowColor = fill;
        }

        ctx.lineWidth = 8;

        ctx.strokeStyle =
            "rgba(0,0,0,.55)";

        ctx.strokeText(
            text,
            0,
            0,
            maxWidth
        );

        ctx.fillStyle = fill;

        ctx.fillText(
            text,
            0,
            0,
            maxWidth
        );

        ctx.restore();
    }

    // =========================
    // PRODUCT IMAGE
    // =========================

    function drawProduct(progress) {

        const centerX =
            canvas.width / 2;

        const centerY = 410;

        const boxW = 430;

        const boxH = 360;

        // Card shadow

        ctx.save();

        ctx.shadowBlur = 30;

        ctx.shadowOffsetY = 15;

        ctx.shadowColor =
            "rgba(0,0,0,.45)";

        roundedRect(
            ctx,
            centerX - boxW / 2,
            centerY - boxH / 2,
            boxW,
            boxH,
            30
        );

        ctx.fillStyle =
            "rgba(255,255,255,.97)";

        ctx.fill();

        ctx.restore();

        if (!productImage) {

            ctx.save();

            ctx.fillStyle = "#374151";

            ctx.font =
                "bold 25px Arial";

            ctx.textAlign = "center";

            ctx.textBaseline = "middle";

            ctx.fillText(
                "📷 PRODUCT IMAGE",
                centerX,
                centerY
            );

            ctx.restore();

            return;
        }

        const img = productImage;

        const imageProgress =
            (Math.sin(
                progress * Math.PI * 2
            ) + 1) / 2;

        const zoom =
            1 +
            imageProgress * 0.045;

        const maxW = 390 * zoom;

        const maxH = 320 * zoom;

        const ratio =
            Math.min(
                maxW / img.width,
                maxH / img.height
            );

        const w =
            img.width * ratio;

        const h =
            img.height * ratio;

        const x =
            centerX - w / 2;

        const y =
            centerY - h / 2;

        ctx.save();

        // Slight 3D-like movement

        const tilt =
            Math.sin(
                progress * Math.PI * 2
            ) * 0.035;

        ctx.translate(
            centerX,
            centerY
        );

        ctx.transform(
            1,
            tilt,
            tilt,
            1,
            0,
            0
        );

        ctx.translate(
            -centerX,
            -centerY
        );

        roundedRect(
            ctx,
            centerX - boxW / 2 + 8,
            centerY - boxH / 2 + 8,
            boxW - 16,
            boxH - 16,
            25
        );

        ctx.clip();

        ctx.drawImage(
            img,
            x,
            y,
            w,
            h
        );

        ctx.restore();
    }

    // =========================
    // BACKGROUND
    // =========================

    function drawBackground(progress) {

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                canvas.width,
                canvas.height
            );

        gradient.addColorStop(
            0,
            "#111827"
        );

        gradient.addColorStop(
            0.5,
            "#1e3a8a"
        );

        gradient.addColorStop(
            1,
            "#581c87"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Animated circles

        for (let i = 0; i < 7; i++) {

            const x =
                (i * 97 +
                progress * 160) %
                (canvas.width + 150) - 75;

            const y =
                100 +
                i * 125 +
                Math.sin(
                    progress * Math.PI * 2 +
                    i
                ) * 25;

            const radius =
                25 + i * 5;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(255,255,255,.055)";

            ctx.fill();
        }
    }

    // =========================
    // MAIN FRAME
    // =========================

    function renderFrame(progress) {

        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(
            0,
            0,
            W,
            H
        );

        drawBackground(progress);

        // Brand top

        drawAnimatedText(
            brand.value,
            W / 2,
            70,
            34,
            brandAnimation.value,
            progress,
            "#fbbf24",
            450
        );

        // Product image

        drawProduct(progress);

        // Product name

        drawAnimatedText(
            productName.value,
            W / 2,
            635,
            38,
            nameAnimation.value,
            progress,
            "#ffffff",
            500
        );

        // Price box

        ctx.save();

        roundedRect(
            ctx,
            120,
            685,
            300,
            82,
            25
        );

        ctx.fillStyle =
            "rgba(255,255,255,.12)";

        ctx.fill();

        ctx.restore();

        drawAnimatedText(
            price.value,
            W / 2,
            725,
            42,
            priceAnimation.value,
            progress,
            "#fde047",
            420
        );

        // Delivery

        drawAnimatedText(
            delivery.value,
            W / 2,
            805,
            27,
            deliveryAnimation.value,
            progress,
            "#86efac",
            480
        );

        // Description

        const desc =
            description.value.trim();

        if (desc) {

            const lines =
                wrapText(
                    desc,
                    440,
                    20
                );

            ctx.save();

            ctx.globalAlpha = 0.95;

            ctx.font =
                "bold 20px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillStyle =
                "#f3f4f6";

            const startY =
                855 -
                (lines.length - 1) * 12;

            lines.forEach(
                (line, index) => {

                    ctx.fillText(
                        line,
                        W / 2,
                        startY +
                        index * 27
                    );

                }
            );

            ctx.restore();
        }

        // Bottom call-to-action

        ctx.save();

        roundedRect(
            ctx,
            150,
            915,
            240,
            35,
            17
        );

        ctx.fillStyle =
            "#f59e0b";

        ctx.fill();

        ctx.fillStyle =
            "#111827";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "ORDER NOW",
            W / 2,
            933
        );

        ctx.restore();
    }

    // =========================
    // PREVIEW
    // =========================

    function startPreview() {

        stopEverything();

        previewRunning = true;

        const duration =
            Number(durationInput.value);

        const start =
            performance.now();

        setStatus(
            "▶ Preview چل رہا ہے..."
        );

        function loop(now) {

            if (!previewRunning) {
                return;
            }

            const elapsed =
                (now - start) / 1000;

            const progress =
                (elapsed % duration) /
                duration;

            renderFrame(progress);

            animationFrame =
                requestAnimationFrame(loop);
        }

        animationFrame =
            requestAnimationFrame(loop);
    }

    // =========================
    // STOP
    // =========================

    function stopEverything() {

        previewRunning = false;

        if (animationFrame) {

            cancelAnimationFrame(
                animationFrame
            );

            animationFrame = null;
        }

        if (
            recorder &&
            recorder.state !== "inactive"
        ) {

            recorder.stop();
        }
    }

    // =========================
    // VIDEO CREATION
    // =========================

    function createVideo() {

        stopEverything();

        if (
            !canvas.captureStream ||
            !window.MediaRecorder
        ) {

            setStatus(
                "❌ آپ کے browser میں video recording support نہیں ہے۔ Google Chrome کا تازہ ورژن استعمال کریں۔"
            );

            return;
        }

        const duration =
            Number(durationInput.value);

        const stream =
            canvas.captureStream(30);

        let mimeType =
            "video/webm;codecs=vp9";

        if (
            !MediaRecorder.isTypeSupported(
                mimeType
            )
        ) {

            mimeType =
                "video/webm;codecs=vp8";
        }

        if (
            !MediaRecorder.isTypeSupported(
                mimeType
            )
        ) {

            mimeType = "video/webm";
        }

        try {

            recorder =
                new MediaRecorder(
                    stream,
                    {
                        mimeType,
                        videoBitsPerSecond:
                            5_000_000
                    }
                );

        } catch (error) {

            setStatus(
                "❌ Recorder start نہیں ہو سکا: " +
                error.message
            );

            return;
        }

        recordedChunks = [];

        recorder.ondataavailable =
            function (event) {

                if (
                    event.data &&
                    event.data.size > 0
                ) {

                    recordedChunks.push(
                        event.data
                    );
                }
            };

        recorder.onerror =
            function (event) {

                setStatus(
                    "❌ Video recording error."
                );

                recording = false;
            };

        recorder.onstop =
            function () {

                recording = false;

                const blob =
                    new Blob(
                        recordedChunks,
                        {
                            type: mimeType
                        }
                    );

                if (videoUrl) {

                    URL.revokeObjectURL(
                        videoUrl
                    );
                }

                videoUrl =
                    URL.createObjectURL(
                        blob
                    );

                downloadLink.href =
                    videoUrl;

                downloadLink.download =
                    "product-video.webm";

                downloadLink.style.display =
                    "inline-block";

                setStatus(
                    "✅ Video تیار ہے۔ Download Video دبائیں۔"
                );
            };

        downloadLink.style.display =
            "none";

        recording = true;

        setStatus(
            "🎥 Video بن رہی ہے... " +
            duration +
            " seconds انتظار کریں۔"
        );

        recorder.start(100);

        const start =
            performance.now();

        function recordFrame(now) {

            if (!recording) {
                return;
            }

            const elapsed =
                (now - start) / 1000;

            const progress =
                clamp(
                    elapsed / duration,
                    0,
                    1
                );

            renderFrame(progress);

            if (elapsed >= duration) {

                renderFrame(1);

                setTimeout(
                    function () {

                        if (
                            recorder &&
                            recorder.state !==
                            "inactive"
                        ) {

                            recorder.stop();
                        }

                    },
                    150
                );

                return;
            }

            animationFrame =
                requestAnimationFrame(
                    recordFrame
                );
        }

        animationFrame =
            requestAnimationFrame(
                recordFrame
            );
    }

    // =========================
    // RESET
    // =========================

    function resetAll() {

        stopEverything();

        productImage = null;

        imageInput.value = "";

        productName.value =
            "Beautiful Product";

        price.value =
            "Rs. 999";

        delivery.value =
            "FREE DELIVERY";

        brand.value =
            "WAQAR";

        description.value =
            "High quality product. Order now and get it delivered to your doorstep.";

        orderLink.value = "";

        durationInput.value =
            "15";

        nameAnimation.value =
            "static";

        priceAnimation.value =
            "zoom";

        deliveryAnimation.value =
            "float";

        brandAnimation.value =
            "orbit";

        downloadLink.style.display =
            "none";

        if (videoUrl) {

            URL.revokeObjectURL(
                videoUrl
            );

            videoUrl = null;
        }

        renderFrame(0);

        setStatus(
            "Reset ہوگیا۔ اب Product Image لگائیں۔"
        );
    }

    // =========================
    // LIVE PREVIEW WHEN TEXT CHANGES
    // =========================

    const liveInputs = [
        productName,
        price,
        delivery,
        brand,
        description,
        nameAnimation,
        priceAnimation,
        deliveryAnimation,
        brandAnimation
    ];

    liveInputs.forEach(
        function (element) {

            element.addEventListener(
                "input",
                function () {

                    if (!previewRunning &&
                        !recording) {

                        renderFrame(0);
                    }

                }
            );

            element.addEventListener(
                "change",
                function () {

                    if (!previewRunning &&
                        !recording) {

                        renderFrame(0);
                    }

                }
            );

        }
    );

    // =========================
    // BUTTONS
    // =========================

    previewBtn.addEventListener(
        "click",
        startPreview
    );

    createBtn.addEventListener(
        "click",
        createVideo
    );

    stopBtn.addEventListener(
        "click",
        function () {

            stopEverything();

            renderFrame(0);

            setStatus(
                "⛔ Stopped."
            );

        }
    );

    resetBtn.addEventListener(
        "click",
        resetAll
    );

    // =========================
    // INITIAL SCREEN
    // =========================

    renderFrame(0);

})();
