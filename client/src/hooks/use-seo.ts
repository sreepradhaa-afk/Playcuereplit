import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

export function useSEO({ title, description, keywords, ogImage = "/og-image.png" }: SEOProps) {
  useEffect(() => {
    document.title = title;

    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute("content", content);
      } else {
        element = document.createElement("meta");
        const selectorParts = selector.match(/\[(.+?)="(.+?)"\]/);
        if (selectorParts) {
          element.setAttribute(selectorParts[1], selectorParts[2]);
          element.setAttribute("content", content);
          document.head.appendChild(element);
        }
      }
    };

    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[name="title"]', title);
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', ogImage);
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', ogImage);

    if (keywords) {
      updateMetaTag('meta[name="keywords"]', keywords);
    }

    return () => {
      document.title = "PlayCue - Family Party Games | Play Pictionary, Charades & More Online";
    };
  }, [title, description, keywords, ogImage]);
}
