from youtube_transcript_api import (
    YouTubeTranscriptApi,
    TranscriptsDisabled,
    NoTranscriptFound,
    CouldNotRetrieveTranscript,
)
from urllib.parse import urlparse, parse_qs

def extract_video_id(youtube_url: str) -> str:
    """
    Extracts the YouTube video ID from various possible URL formats.

    Supports:
    - Shortened URLs (youtu.be/VIDEO_ID)
    - Standard URLs (youtube.com/watch?v=VIDEO_ID)
    - Mobile URLs (m.youtube.com)
    - Shorts URLs (youtube.com/shorts/VIDEO_ID)

    Parameters:
        youtube_url (str): Full YouTube URL.

    Returns:
        str: The extracted video ID.

    Raises:
        ValueError: If URL is invalid or video ID cannot be found.
    """
    parsed_url = urlparse(youtube_url)
    
    # Handle youtu.be short URLs
    if parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]  # remove leading '/'
    
    # Handle standard and mobile YouTube URLs
    elif parsed_url.hostname in ('www.youtube.com', 'youtube.com', 'm.youtube.com'):
        # Special case for YouTube Shorts URLs
        if parsed_url.path.startswith('/shorts/'):
            return parsed_url.path.split('/')[-1]
        
        # For standard watch URLs, extract 'v' query param
        query = parse_qs(parsed_url.query)
        return query.get('v', [None])[0]
    
    else:
        # URL does not match any supported YouTube format
        raise ValueError("Invalid YouTube URL")


def fetch_transcript(youtube_url: str):
    """
    Fetches the transcript for a YouTube video by URL.

    Attempts to get the transcript using YouTubeTranscriptApi.
    Handles various exceptions if transcripts are disabled or unavailable.

    Parameters:
        youtube_url (str): Full YouTube video URL.

    Returns:
        dict: {
            "full_transcript": List of transcript entries with timestamps,
            "plain_text": Concatenated transcript text without timestamps
        }

    Raises:
        ValueError: If video ID extraction fails or no transcript is found.
    """
    # Extract video ID from URL
    video_id = extract_video_id(youtube_url)
    if not video_id:
        raise ValueError("Unable to extract video ID from URL")

    try:
        # Try to directly get the transcript (usually English)
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
    
    except (TranscriptsDisabled, NoTranscriptFound):
        # If transcript is disabled or not found, try to find an English transcript in available transcripts
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            transcript = transcript_list.find_transcript(['en']).fetch()
        except Exception as e:
            # Raise error if no English transcript found or fetch fails
            raise ValueError(f"No transcript available for video ID: {video_id}") from e
    
    except CouldNotRetrieveTranscript as e:
        # Could not fetch transcript due to other issues (e.g., network)
        raise ValueError(f"Could not retrieve transcript for video ID: {video_id}") from e

    # Concatenate all transcript entries' text to form plain transcript string
    plain_text = " ".join([entry.get('text', '') for entry in transcript])

    return {
        "full_transcript": transcript,
        "plain_text": plain_text
    }


from pytubefix import YouTube
from pytubefix.cli import on_progress
import os
import re

def downloadYoutubeVideoLocal(videoURL: str):
    """
    Downloads a YouTube video to a specified local path relative to the current working directory.
    Parameters:
        videoURL (str): The URL of the YouTube video.

    Returns:
        None
    """
    try:
        yt = YouTube(videoURL, on_progress_callback=on_progress)
        ys = yt.streams.filter(progressive=True, file_extension='mp4').get_highest_resolution()
        currentWorkingDirectory = os.getcwd()
        print("currentWorkingDirectory: ", currentWorkingDirectory)
        output_path = os.path.join(currentWorkingDirectory, "app", "downloads", "video")
        if not os.path.exists(output_path):
            os.makedirs(output_path)
        ys.download(output_path=output_path, filename="input.mp4")
        print(f"Video downloaded successfully: {yt.title}")
    except Exception as e:
        raise ValueError(f"Error downloading video: {e}")
