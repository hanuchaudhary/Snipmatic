from google import genai
import json
import os
import re

class AI:
    def __init__(self):
        ai_api_key = os.getenv('AI_API_KEY')
        if not ai_api_key:
            raise ValueError("AI_API_KEY is not set")
        self.gemini_client = genai.Client(api_key=ai_api_key)
        self.model = "gemini-3.7-flash"
    
    def identify_moments(self, transcript: dict, prompt: str):
        response = self.gemini_client.interactions.create(model=self.model, input="""
    This is a podcast video transcript consisting of word, along with each words's start and end time. I am looking to create clips between a minimum of 30 and maximum of 60 seconds long. The clip should never exceed 60 seconds.

    Your task is to find and extract stories, or question and their corresponding answers from the transcript.
    Each clip should begin with the question and conclude with the answer.
    It is acceptable for the clip to include a few additional sentences before a question if it aids in contextualizing the question.

    Please adhere to the following rules:
    - Ensure that clips do not overlap with one another.
    - Start and end timestamps of the clips should align perfectly with the sentence boundaries in the transcript.
    - Only use the start and end timestamps provided in the input. modifying timestamps is not allowed.
    - Format the output as a list of JSON objects, each representing a clip with 'start' and 'end' timestamps: [{"start": seconds, "end": seconds}, ...clip2, clip3]. The output should always be readable by the python json.loads function.
    - Aim to generate longer clips between 40-60 seconds, and ensure to include as much content from the context as viable.

    Avoid including:
    - Moments of greeting, thanking, or saying goodbye.
    - Non-question and answer interactions.

    If there are no valid clips to extract, the output should be an empty list [], in JSON format. Also readable by json.loads() in Python.

    The transcript is as follows:\n\n""" + str(transcript))
        text = response.output_text.strip()
        print(f"Identified moments response: {text}")

        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)

        moments = json.loads(text)
        if not isinstance(moments, list):
            raise ValueError(f"Expected a list of moments, got {type(moments)}")

        return moments
