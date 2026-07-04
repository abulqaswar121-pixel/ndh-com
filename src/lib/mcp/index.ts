import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listMyTasks from "./tools/list-my-tasks";
import listMyEnrollments from "./tools/list-my-enrollments";
import listServices from "./tools/list-services";

// The OAuth issuer MUST be the direct Supabase host. On publish, SUPABASE_URL is
// rewritten to the `.lovable.cloud` proxy, which mcp-js rejects (RFC 8414 issuer
// mismatch). VITE_SUPABASE_PROJECT_ID is inlined at build time by Vite.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "ndh-mcp",
  title: "Najeeb Digital Hub",
  version: "0.1.0",
  instructions:
    "Tools for Najeeb Digital Hub (NDH). Sign in to read your NDH profile, tasks, and course enrollments. `list_ndh_services` is public.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyProfile, listMyTasks, listMyEnrollments, listServices],
});