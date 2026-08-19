import ffmpeg

class FFMPEG:
    def __init__(self):
        self.ffmpeg = ffmpeg

    def extract_audio(self, video_path: str, audio_path: str):
        try:
            self.ffmpeg.input(video_path).output(audio_path).run()
        except Exception as e:
            print(f"Error extracting audio: {e}")
            raise e