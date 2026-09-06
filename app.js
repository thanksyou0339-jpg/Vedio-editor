const canvas =
    document.getElementById(
        "videoCanvas"
    );

const ctx =
    canvas.getContext(
        "2d"
    );


const W =
    canvas.width;

const H =
    canvas.height;


let productImage =
    null;


let isPreviewing =
    false;



/* IMAGE UPLOAD */

document
    .getElementById("productImage")
    .addEventListener(
        "change",
        function(event) {

            const file =
                event.target.files[0];

            if(!file) return;


            const url =
                URL.createObjectURL(
                    file
                );


            productImage =
                new Image();


            productImage.onload =
                function() {

                    URL.revokeObjectURL(
                        url
                    );

                    renderScene(
                        0
                    );


                    setStatus(
                        "تصویر تیار ہے۔ Preview یا Create Video دبائیں۔"
                    );

                };


            productImage.src =
                url;

        }
    );



/* GET VALUE */

function value(id) {

    return document
        .getElementById(id)
        .value;

}



/* BACKGROUND */

function drawBackground() {

    const color =
        value(
            "backgroundColor"
        );


    ctx.fillStyle =
        color;


    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* decorative light */

    const gradient =
        ctx.createRadialGradient(
            W / 2,
            260,
            20,
            W / 2,
            260,
            500
        );


    gradient.addColorStop(
        0,
        "rgba(255,255,255,.08)"
    );


    gradient.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        W,
        H
    );

}



/* PRODUCT IMAGE */

function drawProduct(
    progress
) {

    if(!productImage) {

        ctx.fillStyle =
            "#334155";

        ctx.beginPath();

        ctx.roundRect(
            35,
            100,
            W - 70,
            500,
            25
        );

        ctx.fill();


        ctx.fillStyle =
            "#cbd5e1";

        ctx.font =
            "700 28px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Product Image",
            W / 2,
            360
        );

        return;

    }


    const iw =
        productImage.width;


    const ih =
        productImage.height;


    let scale =
        Math.min(
            (W - 70) / iw,
            500 / ih
        );


    /*
       Product خود بھی
       تھوڑا 3D-style
       move کرے گا
    */

    scale *=
        1 +
        Math.sin(
            progress *
            Math.PI *
            2
        ) * .035;


    const width =
        iw * scale;


    const height =
        ih * scale;


    const x =
        (W - width) / 2;


    const y =
        350 -
        height / 2 +
        Math.sin(
            progress *
            Math.PI *
            2
        ) * 12;


    ctx.save();


    ctx.shadowColor =
        "rgba(0,0,0,.5)";

    ctx.shadowBlur =
        30;


    ctx.beginPath();

    ctx.roundRect(
        35,
        100,
        W - 70,
        500,
        25
    );

    ctx.clip();


    ctx.drawImage(
        productImage,
        x,
        y,
        width,
        height
    );


    ctx.restore();

}



/* TEXT */

function drawTexts(
    progress
) {

    const textColor =
        value(
            "textColor"
        );


    const priceColor =
        value(
            "priceColor"
        );


    const buttonColor =
        value(
            "buttonColor"
        );


    const name =
        value(
            "productName"
        );


    const price =
        value(
            "productPrice"
        );


    const delivery =
        value(
            "productDelivery"
        );


    const description =
        value(
            "productDescription"
        );


    const brand =
        value(
            "productBrand"
        );


    /*
       BRAND
    */

    drawAnimatedText(

        ctx,

        brand,

        W / 2,

        55,

        "800 20px Arial",

        textColor,

        value(
            "brandAnimation"
        ),

        progress

    );



    /*
       PRODUCT NAME
    */

    drawAnimatedText(

        ctx,

        name,

        W / 2,

        670,

        "900 42px Arial",

        textColor,

        value(
            "nameAnimation"
        ),

        progress

    );



    /*
       PRICE
    */

    drawAnimatedText(

        ctx,

        price,

        W / 2,

        750,

        "900 58px Arial",

        priceColor,

        value(
            "priceAnimation"
        ),

        progress

    );



    /*
       DELIVERY
    */

    drawAnimatedText(

        ctx,

        delivery,

        W / 2,

        810,

        "800 27px Arial",

        textColor,

        value(
            "deliveryAnimation"
        ),

        progress

    );



    /*
       DESCRIPTION
    */

    const descTransform =
        animationTransform(

            value(
                "descriptionAnimation"
            ),

            progress,

            W / 2,

            865

        );


    ctx.save();


    ctx.globalAlpha =
        descTransform.opacity;


    ctx.translate(
        descTransform.x,
        descTransform.y
    );


    ctx.scale(
        descTransform.scale,
        descTransform.scale
    );


    ctx.fillStyle =
        "#dbe4ff";


    ctx.font =
        "500 20px Arial";


    ctx.textAlign =
        "center";


    const words =
        description.split(" ");


    let line =
        "";


    let lineY =
        0;


    for(
        let i = 0;
        i < words.length;
        i++
    ) {

        const test =
            line +
            words[i] +
            " ";


        if(
            test.length > 42
        ) {

            ctx.fillText(
                line,
                0,
                lineY
            );


            line =
                words[i] +
                " ";

            lineY +=
                27;

        } else {

            line =
                test;

        }

    }


    ctx.fillText(
        line,
        0,
        lineY
    );


    ctx.restore();



    /*
       ORDER BUTTON
    */

    ctx.fillStyle =
        buttonColor;


    ctx.beginPath();


    ctx.roundRect(
        145,
        905,
        250,
        45,
        23
    );


    ctx.fill();


    ctx.fillStyle =
        "#fff";


    ctx.font =
        "900 20px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        "ORDER NOW",
        W / 2,
        934
    );

}



/* MAIN RENDER */

function renderScene(
    progress
) {

    drawBackground();

    drawProduct(
        progress
    );

    drawTexts(
        progress
    );

}



/* PREVIEW */

document
    .getElementById(
        "previewBtn"
    )
    .addEventListener(
        "click",
        function() {

            if(!productImage) {

                setStatus(
                    "پہلے Product Image Upload کریں۔"
                );

                return;

            }


            if(isPreviewing)
                return;


            isPreviewing =
                true;


            const start =
                performance.now();


            const duration =
                Number(
                    value(
                        "duration"
                    )
                ) * 1000;


            function animate() {

                const elapsed =
                    performance.now()
                    - start;


                let progress =
                    elapsed /
                    duration;


                if(progress > 1)
                    progress = 1;


                renderScene(
                    progress
                );


                if(progress < 1) {

                    requestAnimationFrame(
                        animate
                    );

                } else {

                    isPreviewing =
                        false;

                }

            }


            animate();

        }
    );



/* CREATE VIDEO */

document
    .getElementById(
        "createVideoBtn"
    )
    .addEventListener(
        "click",
        function() {

            if(!productImage) {

                setStatus(
                    "پہلے Product Image Upload کریں۔"
                );

                return;

            }


            const duration =
                Number(
                    value(
                        "duration"
                    )
                ) * 1000;


            setStatus(
                "🎬 Video بن رہی ہے..."
            );


            startVideoRecording(

                canvas,

                duration,

                renderScene,

                function(
                    url,
                    blob
                ) {

                    const download =
                        document.getElementById(
                            "downloadVideo"
                        );


                    download.href =
                        url;


                    download.download =
                        "product-video.webm";


                    download.style.display =
                        "block";


                    setStatus(
                        "✅ Video تیار ہے۔ نیچے Save Video دبائیں۔"
                    );

                }

            );

        }
    );



/* STATUS */

function setStatus(
    message
) {

    document
        .getElementById(
            "status"
        )
        .textContent =
        message;

}



/* LIVE UPDATE */

const liveInputs = [

    "productName",
    "productPrice",
    "productDelivery",
    "productDescription",
    "productBrand",
    "backgroundColor",
    "textColor",
    "priceColor",
    "buttonColor",
    "nameAnimation",
    "priceAnimation",
    "deliveryAnimation",
    "brandAnimation",
    "descriptionAnimation"

];


liveInputs.forEach(
    function(id) {

        document
            .getElementById(id)
            .addEventListener(
                "input",
                function() {

                    renderScene(
                        0
                    );

                }
            );

    }
);



/* INITIAL */

renderScene(
    0
);
