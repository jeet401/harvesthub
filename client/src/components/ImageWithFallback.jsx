import * as React from "react";

export function ImageWithFallback({ src, alt, className, fallbackSrc = "/placeholder.jpg", ...props }) {
  const [imgSrc, setImgSrc] = React.useState(src);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}