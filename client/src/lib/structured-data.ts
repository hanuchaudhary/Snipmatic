export function generateJsonLd(
  type: "homepage" | "tool" | "auth" = "homepage"
) {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Snipmatic",
    description:
      "AI-powered tool that transforms YouTube videos into viral social media clips",
    url: "https://snipmatic.online",
    logo: "https://snipmatic.online/icon.png",
    applicationCategory: "VideoEditingApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    creator: [
      {
        "@type": "Person",
        name: "Kush Chaudhary",
        url: "https://kushchaudhary.com",
      },
      {
        "@type": "Person",
        name: "Kushagra Singhal",
        url: "https://x.com/kuahxD",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Snipmatic",
      logo: {
        "@type": "ImageObject",
        url: "https://snipmatic.online/icon.png",
      },
    },
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Snipmatic",
    url: "https://snipmatic.online",
    logo: "https://snipmatic.online/icon.png",
    description:
      "AI-powered video clipping platform for creating viral social media content",
    foundingDate: "2025",
    sameAs: [
      "https://x.com/snipmatic",
      "https://github.com/hanuchaudhary/Clipper",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "English",
    },
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Snipmatic",
    url: "https://snipmatic.online",
    description: "Transform YouTube videos into viral shorts with AI",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://snipmatic.online/clip?url={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  if (type === "homepage") {
    return [baseStructuredData, organizationData, websiteData];
  } else if (type === "tool") {
    return [baseStructuredData];
  } else {
    return [organizationData];
  }
}
