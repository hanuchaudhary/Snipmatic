import json
import os

from google import genai
from google.genai import types


class AI:
    def __init__(self):
        api_key = os.getenv("AI_API_KEY")
        if not api_key:
            raise ValueError("AI_API_KEY is not set")
        self.client = genai.Client(api_key=api_key)
        self.model = os.getenv("AI_MODEL", "gemini-3.8-flash")

    def identify_moments(self, transcript: dict, prompt: str):
        instruction = """Find self-contained stories or questions and their answers in this podcast transcript.
Return only a JSON object with a clips array: {"clips":[{"start":0.0,"end":45.0}]}.
Each clip must be 30 to 60 seconds, preferably 40 to 60 seconds. Do not overlap clips.
Use only timestamps provided in the transcript, align to sentence boundaries, and do not invent timestamps.
Skip greetings, thanks, farewells and incomplete answers. Return {"clips":[]} if none qualify.
Additional guidance: """ + (prompt or "None")
        response = self.client.models.generate_content(
            model=self.model,
            contents=json.dumps(transcript, ensure_ascii=False),
            config=types.GenerateContentConfig(
                system_instruction=instruction,
                response_mime_type="application/json",
                temperature=0,
            ),
        )
        if not response.text:
            raise ValueError("Gemini response has no content")
        moments = json.loads(response.text)["clips"]
        if not isinstance(moments, list):
            raise ValueError("Gemini response clips must be a list")
        return moments
