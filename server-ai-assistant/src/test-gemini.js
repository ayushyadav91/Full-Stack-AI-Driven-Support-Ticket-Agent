import dotenv from "dotenv";
dotenv.config();

import { createAgent, gemini } from "@inngest/agent-kit";

async function test() {
  const agent = createAgent({
    name: "Test Agent",
    model: gemini({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-1.5-flash",
    }),
  });

  const result = await agent.run("Say hello in one short sentence.");

  console.log(result.output[0].content);
}

test().catch(console.error);
