const axios = require("axios");
const triggerTwillioCall = require("../controllers/twillio_sms");
const { set } = require("mongoose");

async function executeTransaction(network_name, from, to, data, value) {
  console.log("sending from helper", network_name, from, to, data, value);
  if (!network_name || !from || !to || !data || !value) {
    throw new Error("Missing required fields");
  }
  const amount = "0x" + (value * 10 ** 18).toString(16);

  const requestBody = {
    network_name: "POLYGON_TESTNET_AMOY",
    transaction: {
      from: "0xd10e4a5d95f0060f8da0758e63237ab9f34a7503",
      to,
      data: "0x00",
      amount,
    },
  };
  console.log("testing ", requestBody);
  try {
    const response = await axios.post(
      "https://sandbox-api.okto.tech/api/v1/rawtransaction/execute",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
        },
      }
    );
    console.log("response", response.data);

    const order_id = response.data.data.orderId;
    console.log("response", order_id);

    setTimeout(() => {
      getTransactionStatus(order_id);
    }, 3000);

    return "Transaction executed successfully";
  } catch (error) {
    console.error(
      "Error executing transaction:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to execute transaction"
    );
  }
}

async function getTransactionStatus(order_id) {
  if (!order_id) {
    throw new Error("order_id is required");
  }

  console.log("order_id from getT", order_id);

  try {
    const response = await axios.get(
      "https://sandbox-api.okto.tech/api/v1/rawtransaction/status",
      {
        params: { order_id },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
        },
      }
    );

    const body = `
🔹 Transaction Details 🔹

📝 Order ID: ${order_id}
✅ Status: ${response.data.status}
🔗 Transaction Hash: ${response.data.data.jobs[0].transaction_hash}
🌐 Network: ${response.data.data.jobs[0].network_name}
`;
    triggerTwillioCall(body);

    return response.data;
  } catch (error) {
    console.error(
      "Error getting transaction status:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to get transaction status"
    );
  }
}

async function getPortfolio() {
  try {
    const response = await axios.get(
      "https://sandbox-api.okto.tech/api/v1/portfolio",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
        },
      }
    );

    if (response.data?.data?.tokens) {
      const tokens = response.data.data.tokens;
      const totalTokens = tokens.length;

      const tokenDetails = tokens
        .map(
          (token) =>
            `• ${token.token_name}: ${Number(token.quantity).toFixed(
              4
            )} tokens on ${token.network_name}`
        )
        .join("\n");
      const body = `📊 Portfolio Summary 📊\n\nYou currently hold ${totalTokens} different tokens in your portfolio:\n\n${tokenDetails}\n\nNeed help managing your portfolio? Feel free to ask!`;

      triggerTwillioCall(body);

      return `You currently hold ${totalTokens} different tokens in your portfolio ${tokenDetails} Need help managing your portfolio? Feel free to ask!`;
    }

    return "📊 Your portfolio is currently empty. Would you like to add some tokens?";
  } catch (error) {
    console.error(
      "Error fetching portfolio:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch portfolio"
    );
  }
}
module.exports = {
  executeTransaction,
  getTransactionStatus,
  getPortfolio,
};
