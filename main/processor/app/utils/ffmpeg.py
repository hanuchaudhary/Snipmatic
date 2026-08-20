import os

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

    def _aspect_ratio_filter(self, aspect_ratio: str) -> str | None:
        if aspect_ratio == "9:16":
            return "crop=ih*9/16:ih,scale=1080:1920"
        if aspect_ratio == "16:9":
            return "scale=1920:1080"
        if aspect_ratio == "1:1":
            return "crop=min(iw\\,ih):min(iw\\,ih),scale=1080:1080"
        if aspect_ratio == "4:5":
            return "crop=ih*4/5:ih,scale=1080:1920"
        return None

    def extract_clips(self, original_video_path: str, clips_path: str, metadata: dict):
        try:
            os.makedirs(clips_path, exist_ok=True)
            aspect_ratio = metadata.get("aspect_ratio", "9:16")
            vf = self._aspect_ratio_filter(aspect_ratio)
            moments = metadata.get("moments") or []

            for i, moment in enumerate(moments):
                start = moment.get("start")
                end = moment.get("end")
                if start is None or end is None:
                    continue

                duration = end - start
                if duration <= 0:
                    continue

                output_path = os.path.join(clips_path, f"clip_{i + 1}.mp4")
                stream = self.ffmpeg.input(original_video_path, ss=start, t=duration)
                output_kwargs = {"vcodec": "libx264", "acodec": "aac"}
                if vf:
                    output_kwargs["vf"] = vf

                (
                    stream
                    .output(output_path, **output_kwargs)
                    .overwrite_output()
                    .run(capture_stdout=True, capture_stderr=True)
                )
                print(f"Extracted clip from {start} to {end} -> {output_path}")
        except Exception as e:
            print(f"Error extracting clips: {e}")
            raise e
