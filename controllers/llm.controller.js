// const axios = require("axios");
// const OpenAI = require("openai");
// const { executeTransaction, getPortfolio } = require("../helpers/okto.helper");
// const Contact = require("../models/contact");
// const { getContactByNameForUser } = require("../helpers/getAddressByName");

// function extractTransactionDetails(prompt) {
//   const amountRegex = /\b(\d+(\.\d+)?)\b/; // Matches amounts like 0.001
//   const networkRegex = /over\s+([\w_]+)/i; // Matches "over polygon_testnet_amoy"

//   const amountMatch = prompt.match(amountRegex);
//   const networkMatch = prompt.match(networkRegex);

//   return {
//     amount: amountMatch ? parseFloat(amountMatch[1]) : null,
//     network: networkMatch ? networkMatch[1].toLowerCase() : null,
//   };
// }

// async function getAddressFromName(name) {
//   try {
//     const number = "+917057147271";
//     const test = "John";
//     const agent = await getContactByNameForUser(number, name);
//     return agent.address || null;
//   } catch (error) {
//     console.error("Error fetching address from database:", error);
//     return null;
//   }
// }

// async function handleToolCalls(toolCalls, recipientAddress) {
//   if (!toolCalls || !toolCalls.length) return null;

//   const toolCall = toolCalls[0];
//   const params = JSON.parse(toolCall.function.arguments);

//   switch (toolCall.function.name) {
//     case "executeTransaction":
//       // Ensure recipient address is used from earlier lookup
//       params.to = recipientAddress || params.to;
//       return await executeTransaction(params);
//     case "getPortfolio":
//       return await getPortfolio();
//     default:
//       throw new Error(`Unknown tool call: ${toolCall.function.name}`);
//   }
// }

// async function llmController(userPrompt) {
//   if (!userPrompt) {
//     throw new Error("User prompt is required");
//   }

//   const extractedDetails = extractTransactionDetails(userPrompt);
//   console.log("Extracted Details:", extractedDetails);

//   const { amount, network } = extractedDetails;
//   console.log("Amount:", amount, network);

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

//     let messages = [systemMessage, { role: "user", content: userPrompt }];
//     let recipientAddress = null;

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
//       messages,
//     };

//     if (isTransactionRequest) {
//       recipientAddress = (await getAddressFromName(recipientName)) || null;

//       if (!recipientAddress) {
//         throw new Error(
//           `No wallet address found for recipient: ${recipientName}`
//         );
//       }

//       console.log(amount, network, recipientAddress);

//       // messages.splice(1, 0, {
//       //   role: "system",
//       //   content: `Use these transaction details for successfull transaction: Amount: ${amount} Network: ${network},recipient: ${recipientAddress}`,
//       // });

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
//               properties: {},
//               required: [],
//             },
//           },
//         },
//       ];
//     }

//     const completion = await openai.chat.completions.create(completionOptions);

//     if (!completion.choices?.[0]?.message) {
//       throw new Error("Invalid response from OpenAI API");
//     }

//     const llmResponse = completion.choices[0].message.content;
//     console.log("LLM Response:", llmResponse);

//     // Handle any tool calls
//     if (completion.choices[0].message.tool_calls) {
//       await handleToolCalls(
//         completion.choices[0].message.tool_calls,
//         recipientAddress
//       );
//     }

//     return llmResponse;
//   } catch (error) {
//     console.error("Error in LLM controller:", error);

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

//     throw error;
//   }
// }

// module.exports = llmController;

const axios = require("axios");
const OpenAI = require("openai");
const { executeTransaction, getPortfolio } = require("../helpers/okto.helper");
const { getContactByNameForUser } = require("../helpers/getAddressByName");

function extractTransactionDetails(prompt) {
  const amountRegex = /\b(\d+(\.\d+)?)\b/;
  const networkRegex = /over\s+([\w_]+)/i;
  // const nameRegex = /send\s+[\d.]+\s+(\w+)\s+over/i;

  const amountMatch = prompt.match(amountRegex);
  const networkMatch = prompt.match(networkRegex);
  // const nameMatch = prompt.match(nameRegex);

  return {
    amount: amountMatch ? parseFloat(amountMatch[1]) : null,
    network: networkMatch ? networkMatch[1].toLowerCase() : null,
    recipientName: "John",
  };
}

async function getAddressFromName(recipientName) {
  try {
    const number = "+917057147271";
    const agent = await getContactByNameForUser(number, recipientName);
    return agent?.address || null;
  } catch (error) {
    console.error("Error fetching address from database:", error);
    return null;
  }
}

async function handleToolCalls(toolCalls, transactionDetails) {
  if (!toolCalls || !toolCalls.length) return null;

  const toolCall = toolCalls[0];
  const functionName = toolCall.function.name;
  const test = "John";
  if (functionName === "executeTransaction") {
    const { amount, network } = transactionDetails;
    const recipientAddress = await getAddressFromName(test);

    return await executeTransaction(
      network || "POLYGON_TESTNET_AMOY",
      "0xd10e4a5d95f0060f8da0758e63237ab9f34a7503",
      recipientAddress,
      "0x00",
      amount
    );
  } else if (functionName === "getPortfolio") {
    return await getPortfolio();
  }

  throw new Error(`Unknown tool call: ${functionName}`);
}

async function llmController(userPrompt) {
  if (!userPrompt) {
    throw new Error("User prompt is required");
  }

  const extractedDetails = extractTransactionDetails(userPrompt);
  const { amount, network, recipientName } = extractedDetails;

  console.log("Extracted Details:", { amount, network, recipientName });

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
      amount !== null &&
      recipientName !== null;

    const isPortfolioRequest = userPrompt
      .toLowerCase()
      .match(/portfolio|balance|holdings/);

    let completionOptions = {
      model: "gpt-3.5-turbo",
      messages,
    };

    if (isTransactionRequest) {
      recipientAddress = await getAddressFromName(recipientName);

      if (!recipientAddress) {
        throw new Error(
          `No wallet address found for recipient: ${recipientName}`
        );
      }

      console.log("Transaction details:", {
        amount,
        network: network || "POLYGON_TESTNET_AMOY",
        recipientAddress,
      });

      messages.splice(1, 0, {
        role: "system",
        content: `Execute transaction with: Amount: ${amount}, Network: ${
          network || "POLYGON_TESTNET_AMOY"
        }, To: ${recipientAddress}, From: 0xd10e4a5d95f0060f8da0758e63237ab9f34a7503`,
      });

      completionOptions.tools = [
        {
          type: "function",
          function: {
            name: "executeTransaction",
            description: "Execute a blockchain transaction",
            parameters: {
              type: "object",
              properties: {},
              required: [],
            },
          },
        },
      ];

      completionOptions.tool_choice = {
        type: "function",
        function: { name: "executeTransaction" },
      };
    } else if (isPortfolioRequest) {
      completionOptions.tools = [
        {
          type: "function",
          function: {
            name: "getPortfolio",
            description: "Fetch portfolio information",
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

    if (completion.choices[0].message.tool_calls) {
      const transactionDetails = {
        recipientAddress,
        amount,
        network: network || "POLYGON_TESTNET_AMOY",
      };

      const result = await handleToolCalls(
        completion.choices[0].message.tool_calls,
        transactionDetails
      );

      return `Transaction executed successfully. Details: ${JSON.stringify(
        result
      )}`;
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error in LLM controller:", error);
    throw error;
  }
}

module.exports = llmController;
