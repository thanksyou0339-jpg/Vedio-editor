let mediaRecorder = null;

let recordedChunks = [];


function startVideoRecording(
    canvas,
    duration,
    renderFrame,
    finished
) {

    recordedChunks = [];


    if(!window.MediaRecorder) {

        alert(
            "آپ کے Browser میں Video Recording supported نہیں ہے۔ Chrome یا Edge استعمال کریں۔"
        );

        return;

    }


    const stream =
        canvas.captureStream(30);


    let mimeType =
        "video/webm;codecs=vp9";


    if(
        !MediaRecorder
        .isTypeSupported(mimeType)
    ) {

        mimeType =
            "video/webm";
    }


    mediaRecorder =
        new MediaRecorder(
            stream,
            {
                mimeType
            }
        );


    mediaRecorder.ondataavailable =
        function(event) {

            if(event.data.size > 0) {

                recordedChunks.push(
                    event.data
                );

            }

        };


    mediaRecorder.onstop =
        function() {

            const blob =
                new Blob(
                    recordedChunks,
                    {
                        type:
                            "video/webm"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            finished(
                url,
                blob
            );

        };


    mediaRecorder.start();


    const startTime =
        performance.now();


    function render() {

        const elapsed =
            performance.now()
            - startTime;


        let progress =
            elapsed /
            duration;


        if(progress > 1) {

            progress = 1;

        }


        renderFrame(
            progress
        );


        if(progress < 1) {

            requestAnimationFrame(
                render
            );

        } else {

            setTimeout(
                () => {

                    mediaRecorder.stop();

                },
                200
            );

        }

    }


    render();

}
