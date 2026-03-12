/**
 * Returns a human-readable relative time string from a date string or Date object.
 * e.g. "just now", "about 3 minutes ago", "about 2 hours ago", "3 days ago"
 */
export function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `about ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `about ${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

/**
 * Returns initials (up to 2 characters) from a full name string.
 */
export function getInitials(name) {
  if (!name) return "US";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
}
