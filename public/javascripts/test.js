window.onload = () => {

    (function app(socket) {
        if (socket.connected === false) {
            setTimeout(() => {
                app(socket);
            });
            return;
        } else {
            console.log(`client connection for socket ${socket.id}`);
        }

        var video = document.querySelector('video');

        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        // append to the user's connected devices found by the browser
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = getUserMedia;
        }

        // Prefer camera resolution nearest to 1280x720.
        var constraints = {
            audio: true,
            video: {
                width: 1280,
                height: 720
            }
        }

        socket.send = function (message, a) {
            console.log(a);
            socket.emit('message', {
                sender: socket.id,
                data: message
            });
        }

        /*let canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        canvas.width = ctx.width = constraints.video.width;
        canvas.height = ctx.height = constraints.video.height;*/

        // var peer = new PeerConnection(socket);

        var audio = document.createElement('audio');

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (handle) {
                let element = video;

                // var interval = null;
                var chunks = [];

                element.src = window.URL.createObjectURL(handle);
                element.onloadedmetadata = function (e) {
                    element.play();

                    // var recording = handle.record();
                    var recorder = new MediaRecorder(handle);
                    recorder.start();
                    setInterval(() => {
                        // recording.getRecordedData(sendBlob);
                        recorder.stop();
                        recorder.start();
                    }, 1000);

                    recorder.onstop = function (e) {
                        console.log(chunks);

                        var blob = new Blob(chunks);

                        socket.emit('message', blob);

                        chunks = [];
                    }

                    recorder.ondataavailable = function (e) {
                        chunks.push(e.data);
                    }
                };

                function sendBlob(blob) {
                    var data = {};
                    data.video = blob;
                    data.metadata = 'test metadata';
                    data.action = 'uploaded_video';

                    socket.emit('stream', data);
                }

                // peer.addStream(handle);
                // peer.startBroadcasting();


                // element.onplay = function (e) {
                //     console.log('emitting create event');
                //     socket.emit('createStream', '45eofAf0e1eeAfobpt$');
                // }

                // element.onabort = element.onclose = function (e) {
                //     handle.stop;

                //     console.log('aborted');

                //     if (interval != null) {
                //         interval.unref();
                //         clearInterval(interval);
                //     }
                // };

                // socket.once('createdStream', (data) => {
                //     console.log(data);

                //     var stream = ss.createStream();

                //     ss(socket).emit('stream', stream);

                //     console.log(stream);

                //     interval = setInterval(() => {
                //         // ctx.drawImage(video, 0, 0, ctx.width, ctx.height);
                //         // socket.emit('stream', canvas.toDataURL('image/webp'));
                //         socket.emit('stream', window.URL.createObjectURL(handle));
                //     }, 1000);

                // });
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
            });

    })(io());
}