import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_ndh_services",
  title: "List NDH services",
  description: "Return the catalog of Najeeb Digital Hub bureau service categories (public, no auth required).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const services = [
      "Graphic Design",
      "Web Development",
      "Mobile App Development",
      "Content Writing",
      "Digital Marketing",
      "Video Editing",
      "Photography",
      "Social Media Management",
      "SEO",
      "Branding",
    ];
    return {
      content: [{ type: "text", text: services.join("\n") }],
      structuredContent: { services },
    };
  },
});