export default function manifest() {
  return {
    name: "Find Your FC",
    short_name: "Find Your FC",
    description: "Matched on heart, mind and soul",
    start_url: "/",
    display: "standalone",
    background_color: "#0a111f",
    theme_color: "#0a111f",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
  };
}
