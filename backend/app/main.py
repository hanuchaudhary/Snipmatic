from fastapi import FastAPI, Query
from app.youtube import fetch_transcript
from app.highlight import extract_highlights_from_transcript
from app.youtube import downloadYoutubeVideoLocal

# Initialize FastAPI app
app = FastAPI()

@app.get("/")
def read_root():
    """
    Root endpoint to check if the server is running.
    Returns a simple message.
    """
    return {"message": "Server is running!","status": "OK"}

@app.get("/transcript")
def get_transcript(url: str):
    """
    Endpoint to fetch the transcript of a YouTube video.

    Parameters:
        url (str): A valid YouTube video URL.

    Returns:
        dict: 
            - plain_text: A concatenated string of the full transcript text.
            - full_transcript: A list of transcript entries with 'text', 'start', and 'duration'.
    """
    # Fetch transcript using helper function
    result = fetch_transcript(url)
    
    return {
        "plain_text": result["plain_text"],           # Raw transcript text for LLM input
        "full_transcript": result["full_transcript"]  # Timestamped transcript for UI display and mapping
    }


@app.post("/highlights")
def get_highlight(url: str):
    """
    Endpoint to extract the most meaningful highlight from a YouTube video.

    This does the following:
        1. Fetches the transcript using the YouTube URL.
        2. Sends the plain transcript to a Language Model (LLM) via OpenRouter API.
        3. Receives a highlight text from the LLM.
        4. Finds the corresponding timestamp in the original transcript.

    Parameters:
        url (str): A valid YouTube video URL.

    Returns:
        dict:
            - highlight_text: The highlight content (selected by LLM).
            - start: Timestamp in seconds where the highlight starts.
            - end: Timestamp in seconds where the highlight ends.
            - full_transcript: The full transcript (used by frontend to build UI for trimming, etc.)
            - error (optional): Returned if highlight could not be mapped.
    """
    # Step 1: Fetch both plain and timestamped transcript
    result = fetch_transcript(url)
    full_transcript = result["full_transcript"]
    plain_text = result["plain_text"]

    # Step 2–4: Extract highlight using LLM and map it to timestamp
    highlight_data = extract_highlights_from_transcript(plain_text, full_transcript)

    # Handle case where highlight text couldn’t be matched in the transcript
    if "error" in highlight_data:
        return {"error": highlight_data["error"]}

    # Return final result to frontend
    return {
        "highlight_text": highlight_data["highlight_text"],   # Meaningful quote or section
        "start": highlight_data["start_time"],                # Start timestamp in seconds
        "end": highlight_data["end_time"],                    # End timestamp in seconds
        "full_transcript": full_transcript                    # Required for frontend timeline or subtitle overlay
    }
    
@app.post("/download")
def download_video(videoURL: str):
    """
    Downloads a YouTube video to a specified local path.
    Parameters:
        videoURL (str): The URL of the YouTube video.
    Returns:
        dict: A message indicating the download status.
    """
    
    downloadYoutubeVideoLocal(videoURL)
    
    return {"message": "Video downloaded successfully!"}
