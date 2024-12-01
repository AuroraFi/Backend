const axios = require("axios");
const OpenAI = require("openai");
async function llmController(userPrompt) {
  console.log("User Prompt:", userPrompt);
  const API_KEY = process.env.CHATGPT_API_KEY;
  console.log(API_KEY);
  const openai = new OpenAI({
    apiKey: API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a vitalik buterin talk like him .",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const llmResponse = completion.data.choices[0].message.content;
    console.log("Llm Response:", llmResponse);

    return llmResponse;
  } catch (error) {
    console.error("Error communicating with LLM:", error);

    return "Sorry, I couldn't process your request right now.";
  }
}

module.exports = llmController;
