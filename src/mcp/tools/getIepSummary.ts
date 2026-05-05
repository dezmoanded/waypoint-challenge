import { IEP_SUMMARY_RESOURCE } from "../context/iepSummary.js";

export const GET_IEP_SUMMARY_TOOL = {
  name: "get_iep_summary",
  config: {
    title: "Get IEP Summary",
    description:
      "Fetch the summarized IEP payload that is also exposed as the iep://summary MCP resource.",
  },
  async handler() {
    const result = await IEP_SUMMARY_RESOURCE.read();
    return {
      content: result.contents.map((item) => ({
        type: "text" as const,
        text: item.text,
      })),
    };
  },
} as const;
