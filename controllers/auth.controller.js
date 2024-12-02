const axios = require("axios");
const Auth = require("../models/auth");
const cron = require("node-cron");

exports.storeAuthData = async (req, res) => {
  const { auth_token, refresh_auth_token, device_token, mobile_number } =
    req.body;

  if (!auth_token || !refresh_auth_token || !device_token || !mobile_number) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const authData = new Auth({
    auth_token,
    refresh_auth_token,
    device_token,
    mobile_number,
  });

  try {
    const savedAuth = await authData.save();
    res.status(201).json({
      message: "Authentication data stored successfully",
      data: savedAuth,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to store authentication data",
      error: error.message,
    });
  }
};

exports.getAuthData = async (req, res) => {
  const { mobile_number } = req.query;

  if (!mobile_number) {
    return res
      .status(400)
      .json({ message: "Missing mobile_number query parameter" });
  }

  try {
    const authData = await Auth.findOne({ mobile_number }).sort({
      created_at: -1,
    });

    if (!authData) {
      return res
        .status(404)
        .json({
          message: "No authentication data found for the given mobile number",
        });
    }

    res.status(200).json(authData);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve authentication data",
      error: error.message,
    });
  }
};

async function refreshAuthToken() {
  try {
    const authData = await Auth.findOne().sort({ created_at: -1 });

    if (!authData) {
      return;
    }

    const { refresh_auth_token } = authData;

    const response = await axios.post(
      "https://sandbox-api.okto.tech/api/v1/refresh_token",
      {},
      {
        headers: {
          Authorization: `Bearer ${refresh_auth_token}`,
        },
      }
    );

    if (response.status === 201 && response.data.status === "success") {
      const {
        auth_token,
        refresh_auth_token: newRefreshToken,
        device_token: newDeviceToken,
      } = response.data.data;

      authData.auth_token = auth_token;
      authData.refresh_auth_token = newRefreshToken;
      authData.device_token = newDeviceToken;
      authData.created_at = Date.now();

      await authData.save();
    }
  } catch (error) {
    console.error("Error refreshing auth token:", error.message);
  }
}

cron.schedule("0 * * * *", () => {
  refreshAuthToken();
});
