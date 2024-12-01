const axios = require("axios");

async function executeTransaction(network_name, from, to, data, value) {
  if (!network_name || !from || !to || !data || !value) {
    throw new Error("Missing required fields");
  }

  const requestBody = {
    network_name,
    transaction: {
      from,
      to,
      data,
      value,
    },
  };

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

    return response.data;
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

    return response.data;
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
