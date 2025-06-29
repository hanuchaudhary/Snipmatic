import os
import re
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API key and endpoint config for OpenRouter LLM
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat"
MODEL = "deepseek/deepseek-r1-distill-llama-70b:free"  # Using DeepSeek model via OpenRouter

# Ensure API key is set
if not OPENROUTER_API_KEY:
    raise EnvironmentError("OPENROUTER_API_KEY is not set in the .env file")

def normalize(text):
    """
    Preprocess a string by:
    - Removing punctuation
    - Lowercasing all characters
    This ensures a more robust match when searching highlight text in transcript.
    """
    return re.sub(r"[^\w\s]", "", text).lower()


def call_openrouter_llm(prompt: str) -> str:
    """
    Sends the transcript (as plain text) to the OpenRouter LLM and gets back a highlight.

    Parameters:
        prompt (str): The entire transcript text.

    Returns:
        str: Extracted highlight text (short, meaningful moment from the transcript).
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    # Compose system and user message for the LLM
    body = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are an assistant that extracts important and meaningful highlight-worthy sections from transcripts."
            },
            {
                "role": "user",
                "content": f"Here is a video transcript:\n\n{prompt}\n\nExtract a meaningful highlight or moment from it in plain text. Do not include timestamps or explanation. Only return the highlight text."
            }
        ]
    }

    # Call the OpenRouter API with a 15s timeout
    response = requests.post(OPENROUTER_API_URL, json=body, headers=headers, timeout=15)

    # Check for errors
    if response.status_code != 200:
        raise Exception(f"OpenRouter API Error: {response.status_code}, {response.text}")

    # Extract highlight text from response JSON
    highlight_text = response.json()["choices"][0]["message"]["content"]
    return highlight_text.strip()


def find_highlight_timestamp(highlight: str, transcript: list) -> dict:
    """
    Maps a given highlight (text) back to its position in the full transcript with timestamps.

    Parameters:
        highlight (str): The extracted highlight text from the LLM.
        transcript (list): Full transcript with timestamps. Each entry has 'text', 'start', and 'duration'.

    Returns:
        dict:
            - highlight_text: Original highlight string
            - start_time: Start time in seconds
            - end_time: End time in seconds
        OR
            - error: If highlight not found in transcript
    """
    words_with_timestamps = []
    
    # Break each transcript entry into words and track their original timestamps
    for entry in transcript:
        for word in entry["text"].split():
            words_with_timestamps.append({
                "word": word,
                "start": entry["start"],
                "duration": entry["duration"]
            })

    # Normalize words from both the transcript and the highlight for comparison
    transcript_words = [w["word"] for w in words_with_timestamps]
    normalized_transcript = [normalize(w) for w in transcript_words]
    highlight_words = normalize(highlight).split()

    # Try to match the highlight words in the full transcript
    for i in range(len(normalized_transcript) - len(highlight_words) + 1):
        if normalized_transcript[i:i + len(highlight_words)] == highlight_words:
            start_time = words_with_timestamps[i]["start"]
            end_word = words_with_timestamps[i + len(highlight_words) - 1]
            end_time = end_word["start"] + end_word["duration"]
            return {
                "highlight_text": highlight,
                "start_time": start_time,
                "end_time": end_time
            }

    # If we get here, the highlight text was not found
    return {"error": "Unable to map highlight text to timestamped transcript."}


def extract_highlights_from_transcript(plain_text: str, full_transcript: list) -> dict:
    """
    Combines the LLM extraction and timestamp mapping into one function.

    Steps:
        1. Calls LLM with plain transcript to get a highlight.
        2. Finds where the highlight appears in the full timestamped transcript.

    Parameters:
        plain_text (str): Transcript without timestamps (for LLM).
        full_transcript (list): Original transcript with timestamps.

    Returns:
        dict: Contains highlight text and its start/end timestamps.
    """
    # Step 1: Get highlight from the LLM
    highlight_text = call_openrouter_llm(plain_text)

    # Step 2: Map highlight to timestamped transcript
    timestamp_data = find_highlight_timestamp(highlight_text, full_transcript)
    
    return timestamp_data
