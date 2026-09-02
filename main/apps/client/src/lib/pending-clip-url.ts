const PENDING_YOUTUBE_URL_KEY = "snipmatic:pendingYoutubeUrl";

export function setPendingYoutubeUrl(url: string) {
  sessionStorage.setItem(PENDING_YOUTUBE_URL_KEY, url);
}

export function peekPendingYoutubeUrl(): string | null {
  return sessionStorage.getItem(PENDING_YOUTUBE_URL_KEY);
}

export function consumePendingYoutubeUrl(): string | null {
  const value = sessionStorage.getItem(PENDING_YOUTUBE_URL_KEY);
  if (value) {
    sessionStorage.removeItem(PENDING_YOUTUBE_URL_KEY);
  }
  return value;
}
