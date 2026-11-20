// backend/services/agent/graph/graph.js
import { StateGraph } from "@langchain/langgraph"
import { agentState } from "./state.js"
import { router } from "./router.js"
import { chatAgent } from "../agents/chat.agent.js"
import { searchAgent } from "../agents/search.agent.js"
import { codingAgent } from "../agents/coding.agent.js"
import { pdfAgent } from "../agents/pdf.agent.js"
import { pptAgent } from "../agents/ppt.agent.js"
import { imageAgent } from "../agents/vision.agent.js"

const workflow = new StateGraph(agentState)

// Add nodes
workflow.addNode("router", router)
workflow.addNode("chat", chatAgent)
workflow.addNode("search", searchAgent)
workflow.addNode("coding", codingAgent)
workflow.addNode("pdf", pdfAgent)
workflow.addNode("ppt", pptAgent)
workflow.addNode("image", imageAgent)

// Add edge from start to router
workflow.addEdge("__start__", "router")

// Add conditional edges from router
workflow.addConditionalEdges(
  "router",
  (state) => {
    let agent = state.agent || "chat"
    if (agent === "vision") agent = "image"
    console.log(`🔄 Routing to agent: ${agent}`)
    return agent
  },
  {
    chat: "chat",
    search: "search",      // ✅ Search goes to search
    coding: "coding",
    pdf: "pdf",
    ppt: "ppt",
    image: "image",
  }
)

// ✅ SEARCH -> CHAT (Search results ko chat summarize karega)
workflow.addEdge("search", "chat")

// ✅ Other agents go to end directly
workflow.addEdge("chat", "__end__")
workflow.addEdge("coding", "__end__")
workflow.addEdge("pdf", "__end__")
workflow.addEdge("ppt", "__end__")
workflow.addEdge("image", "__end__")

export const graph = workflow.compile()
