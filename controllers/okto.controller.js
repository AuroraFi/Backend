const axios = require("axios");

exports.executeTransaction = async (req, res) => {
  const { network_name, from, to, data, value } = req.body;

  if (!network_name || !from || !to || !data || !value) {
    return res.status(400).json({ message: "Missing required fields" });
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

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error executing transaction:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Failed to execute transaction",
      error: error.response?.data || error.message,
    });
  }
};
