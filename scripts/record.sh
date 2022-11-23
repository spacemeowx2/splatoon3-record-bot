v4l2-ctl -d /dev/video0 --set-fmt-video=width=1280,height=720,pixelformat=YUYV -p 60
ffmpeg -re \
    -f alsa -ac 2 -i hw:CARD=UHD,DEV=0 \
    -f v4l2 -framerate 60 -video_size 1280x720 -input_format yuyv422 -i /dev/video0 \
    -c:v libx264 -b:v 8000k -preset ultrafast -tune zerolatency \
    -keyint_min 60 -g 60 -sc_threshold 0 \
    -pix_fmt yuv420p \
    -c:a aac -ar 44100 -b:a 160k \
    -f flv \
    rtmp://localhost/live/NS
