/**
 * VideoBlock — shared video embed component
 * Used by all theme renderers for the "video" block type.
 *
 * Usage in any theme's BlockRenderer:
 *   if (type === "video" && content?.videoId) {
 *     return <VideoBlock content={content} radius={radius} />;
 *   }
 */

interface VideoContent {
  platform?: string;
  videoId?: string;
  url?: string;
  caption?: string;
  autoplay?: boolean;
}

export function VideoBlock({
  content,
  radius = "8px",
}: {
  content: VideoContent;
  radius?: string;
}) {
  const { platform = "youtube", videoId, caption } = content;

  if (!videoId) return null;

  let embedUrl = "";

  if (platform === "youtube") {
    embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  } else if (platform === "tiktok") {
    embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
  }

  if (!embedUrl) return null;

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div
        style={{
          position: "relative",
          paddingBottom: platform === "tiktok" ? "177.78%" : "56.25%", // 9:16 for TikTok, 16:9 for YouTube
          height: 0,
          overflow: "hidden",
          borderRadius: radius,
          background: "#000",
        }}
      >
        <iframe
          src={embedUrl}
          title={`${platform} video`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && (
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.8rem",
            textAlign: "center",
            opacity: 0.6,
            lineHeight: 1.5,
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
