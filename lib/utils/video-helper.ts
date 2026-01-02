// lib/utils/video-helper.ts

/**
 * Extracts YouTube ID and returns a clean embed URL.
 * Optimized for performance using RegEx.
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);

  const videoId = (match && match[2].length === 11) ? match[2] : null;

  if (videoId) {
    // Using youtube-nocookie for better privacy/GDPR compliance
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1`;
  }

  return null;
}