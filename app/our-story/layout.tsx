import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story and Global Technology Team",
  description:
    "Learn how FlutterFlirt grew from a focused technology team into a global partner for enterprise systems, automation, and digital transformation.",
  alternates: {
    canonical: "/our-story",
  },
  openGraph: {
    title: "Our Story and Global Technology Team | FlutterFlirt",
    description:
      "Learn how FlutterFlirt grew from a focused technology team into a global partner for enterprise systems, automation, and digital transformation.",
    url: "https://flutterflirt.com/our-story",
  },
};

export default function OurStoryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}