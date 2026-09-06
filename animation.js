function animationTransform(
    type,
    progress,
    centerX,
    centerY
) {

    let x = centerX;
    let y = centerY;

    let scale = 1;

    let rotation = 0;

    let opacity = 1;


    switch(type) {


        case "static":

            break;



        case "fade":

            opacity = progress;

            break;



        case "slideLeft":

            x += (1 - progress) * 500;

            break;



        case "slideRight":

            x -= (1 - progress) * 500;

            break;



        case "slideUp":

            y += (1 - progress) * 300;

            break;



        case "slideDown":

            y -= (1 - progress) * 300;

            break;



        case "zoom":

            scale =
                0.2 +
                progress * 0.8;

            break;



        case "bounce":

            scale =
                1 +
                Math.abs(
                    Math.sin(
                        progress *
                        Math.PI *
                        3
                    )
                ) * 0.15;

            break;



        case "spin":

            rotation =
                progress *
                Math.PI *
                2;

            break;



        case "orbit":

            rotation =
                progress *
                Math.PI *
                2;

            x +=
                Math.cos(
                    progress *
                    Math.PI *
                    2
                ) * 120;

            y +=
                Math.sin(
                    progress *
                    Math.PI *
                    2
                ) * 40;

            break;



        case "float":

            y +=
                Math.sin(
                    progress *
                    Math.PI *
                    4
                ) * 25;

            x +=
                Math.cos(
                    progress *
                    Math.PI *
                    2
                ) * 15;

            break;



        case "shake":

            x +=
                Math.sin(
                    progress *
                    Math.PI *
                    20
                ) * 10;

            rotation =
                Math.sin(
                    progress *
                    Math.PI *
                    20
                ) * 0.05;

            break;



        case "pop":

            if(progress < 0.25) {

                scale =
                    progress / 0.25 * 1.25;

            } else {

                scale =
                    1.25 -
                    (
                        (progress - 0.25)
                        / 0.75
                    ) * 0.25;
            }

            break;



        case "glow":

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



function drawAnimatedText(
    ctx,
    text,
    x,
    y,
    font,
    color,
    animation,
    progress,
    align = "center"
) {

    const t =
        animationTransform(
            animation,
            progress,
            x,
            y
        );


    ctx.save();


    ctx.globalAlpha =
        t.opacity;


    ctx.translate(
        t.x,
        t.y
    );


    ctx.rotate(
        t.rotation
    );


    ctx.scale(
        t.scale,
        t.scale
    );


    ctx.textAlign =
        align;

    ctx.textBaseline =
        "middle";

    ctx.font =
        font;


    ctx.fillStyle =
        color;


    if(animation === "glow") {

        ctx.shadowColor =
            color;

        ctx.shadowBlur =
            25;
    }


    ctx.fillText(
        text,
        0,
        0
    );


    ctx.restore();

}
