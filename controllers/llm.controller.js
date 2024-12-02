// const axios = require("axios");
// const OpenAI = require("openai");
// const executeTransaction = require("../helpers/okto.helper");
// const getPortfolio = require("../helpers/okto.helper");

// async function extractRecipientName(prompt) {
//   const words = prompt.toLowerCase().split(" ");
//   const toIndex = words.indexOf("to");
//   if (toIndex === -1 || toIndex === words.length - 1) return null;

//   let name = words[toIndex + 1];
//   name = name.replace(/[^a-z0-9]/g, "");
//   return name;
// }

// async function getAddressFromName(name) {
//   try {
//     const agent = await Agent.findOne({
//       name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-insensitive match
//     });
//     return agent ? agent.walletAddress : null;
//   } catch (error) {
//     console.error("Error fetching address from database:", error);
//     return null;
//   }
// }

// async function llmController(userPrompt) {
//   if (!userPrompt) {
//     throw new Error("User prompt is required");
//   }

//   console.log("User Prompt:", userPrompt);

//   const API_KEY = process.env.CHATGPT_API_KEY;
//   if (!API_KEY) {
//     throw new Error("CHATGPT_API_KEY environment variable is not set");
//   }

//   const openai = new OpenAI({
//     apiKey: API_KEY,
//   });

//   try {
//     const systemMessage = {
//       role: "system",
//       content:
//         "You are a Multi-AI Agent Framework designed to assist users in managing blockchain portfolios, executing transactions, sending SMS updates on portfolio changes or transactions, and educating users about blockchain concepts like Aptos and Sui. Respond concisely, prioritize actionable outputs, and limit responses to 50 tokens for clarity.",
//     };

//     const messages = [systemMessage, { role: "user", content: userPrompt }];

//     const isTransactionRequest =
//       userPrompt.toLowerCase().includes("send") &&
//       userPrompt.toLowerCase().includes("to") &&
//       /\d+(\.\d+)?/.test(userPrompt);

//     const isPortfolioRequest =
//       userPrompt.toLowerCase().includes("portfolio") ||
//       userPrompt.toLowerCase().includes("balance") ||
//       userPrompt.toLowerCase().includes("holdings");

//     let completionOptions = {
//       model: "gpt-3.5-turbo",
//       messages: messages,
//     };

//     // Add tools for transaction handling if needed
//     if (isTransactionRequest) {
//       const recipientName = extractRecipientName(userPrompt);
//       const recipientAddress = recipientName
//         ? await getAddressFromName(recipientName)
//         : null;

//       if (!recipientAddress) {
//         throw new Error(
//           `No wallet address found for recipient: ${recipientName}`
//         );
//       }

//       messages.splice(1, 0, {
//         role: "system",
//         content: `Use this wallet address for the recipient: ${recipientAddress}`,
//       });
//       // Add the re

//       completionOptions.tools = [
//         {
//           type: "function",
//           function: {
//             name: "executeTransaction",
//             description: "Execute a blockchain transaction to transfer funds",
//             parameters: {
//               type: "object",
//               properties: {
//                 to: {
//                   type: "string",
//                   description: "Recipient address",
//                 },
//                 network: {
//                   type: "string",
//                   description: "Blockchain network",
//                 },
//                 value: {
//                   type: "number",
//                   description: "Amount to send",
//                 },
//               },
//               required: ["to", "network", "value"],
//               additionalProperties: false,
//             },
//           },
//         },
//       ];
//     } else if (isPortfolioRequest) {
//       completionOptions.tools = [
//         {
//           type: "function",
//           function: {
//             name: "getPortfolio",
//             description: "Fetch user's portfolio information and send via SMS",
//             parameters: {
//               type: "object",
//               // properties: {
//               //   sendSMS: {
//               //     type: "boolean",
//               //     description: "Whether to send the portfolio info via SMS",
//               //   },
//               // },
//               // required: ["sendSMS"],
//             },
//           },
//         },
//       ];
//     }

//     const completion = await openai.chat.completions.create(completionOptions);

//     if (
//       !completion.choices ||
//       !completion.choices[0] ||
//       !completion.choices[0].message
//     ) {
//       throw new Error("Invalid response from OpenAI API");
//     }

//     const llmResponse = completion.choices[0].message.content;
//     console.log("LLM Response:", llmResponse);

//     // Handle function calls if present
//     if (completion.choices[0].message.tool_calls) {
//       const toolCall = completion.choices[0].message.tool_calls[0];
//       if (toolCall.function.name === "executeTransaction") {
//         const params = JSON.parse(toolCall.function.arguments);
//         return await executeTransaction(params);
//       }
//     }else if (toolCall.function.name === "getPortfolio") {
//        return await getPortfolio();
//       }
//     }

//     return llmResponse;

//   } catch (error) {
//     console.error("Error in LLM controller:", error);

//     // Provide more specific error messages based on the error type
//     if (error.response?.status === 401) {
//       throw new Error(
//         "Invalid API key. Please check your OpenAI API key configuration."
//       );
//     } else if (error.response?.status === 429) {
//       throw new Error("Rate limit exceeded. Please try again later.");
//     } else if (error.code === "ECONNREFUSED") {
//       throw new Error(
//         "Could not connect to OpenAI API. Please check your internet connection."
//       );
//     }

//     throw new Error(
//       "An error occurred while processing your request: " + error.message
//     );
//   }
// }

// module.exports = llmController;

const axios = require("axios");
const OpenAI = require("openai");
const { executeTransaction, getPortfolio } = require("../helpers/okto.helper");
const Contact = require("../models/contact");
const { getContactByNameForUser } = require("../helpers/getAddressByName");

async function extractRecipientName(prompt) {
  const words = prompt.toLowerCase().split(" ");
  const toIndex = words.indexOf("to");
  if (toIndex === -1 || toIndex === words.length - 1) return null;

  let name = words[toIndex + 1];
  name = name.replace(/[^a-z0-9]/g, "");
  console.log("Recipient Name:", name);
  return name;
}

async function getAddressFromName(name) {
  try {
    const number = "+917057147271";
    const test = "John";
    const agent = await getContactByNameForUser(number, test);
    return agent.address || null;
  } catch (error) {
    console.error("Error fetching address from database:", error);
    return null;
  }
}

async function handleToolCalls(toolCalls, recipientAddress) {
  if (!toolCalls || !toolCalls.length) return null;

  const toolCall = toolCalls[0];
  const params = JSON.parse(toolCall.function.arguments);

  switch (toolCall.function.name) {
    case "executeTransaction":
      // Ensure recipient address is used from earlier lookup
      params.to = recipientAddress || params.to;
      return await executeTransaction(params);
    case "getPortfolio":
      return await getPortfolio();
    default:
      throw new Error(`Unknown tool call: ${toolCall.function.name}`);
  }
}

async function llmController(userPrompt) {
  if (!userPrompt) {
    throw new Error("User prompt is required");
  }

  console.log("User Prompt:", userPrompt);

  const API_KEY = process.env.CHATGPT_API_KEY;
  if (!API_KEY) {
    throw new Error("CHATGPT_API_KEY environment variable is not set");
  }

  const openai = new OpenAI({
    apiKey: API_KEY,
  });

  try {
    const systemMessage = {
      role: "system",
      content:
        "You are a Multi-AI Agent Framework designed to assist users in managing blockchain portfolios, executing transactions, sending SMS updates on portfolio changes or transactions, and educating users about blockchain concepts like Aptos and Sui. Respond concisely, prioritize actionable outputs, and limit responses to 50 tokens for clarity.",
    };

    let messages = [systemMessage, { role: "user", content: userPrompt }];
    let recipientAddress = null;

    const isTransactionRequest =
      userPrompt.toLowerCase().includes("send") &&
      userPrompt.toLowerCase().includes("to") &&
      /\d+(\.\d+)?/.test(userPrompt);

    const isPortfolioRequest =
      userPrompt.toLowerCase().includes("portfolio") ||
      userPrompt.toLowerCase().includes("balance") ||
      userPrompt.toLowerCase().includes("holdings");

    let completionOptions = {
      model: "gpt-3.5-turbo",
      messages,
    };

    if (isTransactionRequest) {
      const recipientName = await extractRecipientName(userPrompt);
      recipientAddress = recipientName
        ? await getAddressFromName(recipientName)
        : null;

      if (!recipientAddress) {
        throw new Error(
          `No wallet address found for recipient: ${recipientName}`
        );
      }

      messages.splice(1, 0, {
        role: "system",
        content: `Use this wallet address for the recipient: ${recipientAddress}`,
      });

      completionOptions.tools = [
        {
          type: "function",
          function: {
            name: "executeTransaction",
            description: "Execute a blockchain transaction to transfer funds",
            parameters: {
              type: "object",
              properties: {
                to: {
                  type: "string",
                  description: "Recipient address",
                },
                network: {
                  type: "string",
                  description: "Blockchain network",
                },
                value: {
                  type: "number",
                  description: "Amount to send",
                },
              },
              required: ["to", "network", "value"],
              additionalProperties: false,
            },
          },
        },
      ];
    } else if (isPortfolioRequest) {
      completionOptions.tools = [
        {
          type: "function",
          function: {
            name: "getPortfolio",
            description: "Fetch user's portfolio information and send via SMS",
            parameters: {
              type: "object",
              properties: {},
              required: [],
            },
          },
        },
      ];
    }

    const completion = await openai.chat.completions.create(completionOptions);

    if (!completion.choices?.[0]?.message) {
      throw new Error("Invalid response from OpenAI API");
    }

    const llmResponse = completion.choices[0].message.content;
    console.log("LLM Response:", llmResponse);

    // Handle any tool calls
    if (completion.choices[0].message.tool_calls) {
      await handleToolCalls(
        completion.choices[0].message.tool_calls,
        recipientAddress
      );
    }

    return llmResponse;
  } catch (error) {
    console.error("Error in LLM controller:", error);

    if (error.response?.status === 401) {
      throw new Error(
        "Invalid API key. Please check your OpenAI API key configuration."
      );
    } else if (error.response?.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    } else if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Could not connect to OpenAI API. Please check your internet connection."
      );
    }

    throw error;
  }
}

module.exports = llmController;
