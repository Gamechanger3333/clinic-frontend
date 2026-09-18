import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/appointments",
        "/patients",
        "/doctors",
        "/departments",
        "/billing",
        "/prescriptions",
        "/lab-reports",
        "/medical-records",
        "/pharmacy",
        "/notifications",
        "/settings",
        "/admin",
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sitemap.xml`,
  };
}
