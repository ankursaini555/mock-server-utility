"use strict";
const axios = require("axios");

// checkHealth function to check the health of the current service and its dependencies
async function checkHealth(currentService, dependencyServices) {
  const response = {
    name: currentService.name,
    status: "up",
    dependencyServices: [],
    timestamp: new Date().toISOString(),
    statusCode: 200,
  };

  // Check the status of dependency services if provided
  if (dependencyServices && Array.isArray(dependencyServices)) {
    const dependencyChecks = await Promise.allSettled(
      dependencyServices.map(async (service) => {
        try {
          const result = await axios.get(service.url, { timeout: 5000 });
          return {
            name: service.name,
            status: result.status === 200 ? "up" : "down",
          };
        } catch {
          response.statusCode = 299;
          return {
            name: service.name,
            status: "down",
          };
        }
      })
    );

    // Map the results to extract statuses
    response.dependencyServices = dependencyChecks.map((check, index) => {
      if (check.status === "fulfilled") {
        return check.value;
      } else {
        return {
          name: dependencyServices[index].name,
          status: "down",
        };
      }
    });
  }

  return response;
}

// convert the JSON response to a text format
function JsonResponseToText(json) {
  let text = "";

  // Add the main service name and status
  text += `${json.name
    .replace(/\s+/g, "_")
    .toUpperCase()}=${json.status.toUpperCase()}\n`;

  // Process dependency services
  if (Array.isArray(json.dependencyServices)) {
    json.dependencyServices.forEach((service) => {
      text += `${service.name
        .replace(/\s+/g, "_")
        .toUpperCase()}=${service.status.toUpperCase()}\n`;
    });
  }

  // Add the timestamp
  text += `TIME=${json.timestamp}`;

  return text.trim();
}

// Controller function for the /health API
async function healthController(req, res) {
  const currentService = {
    name: "mock-server-utility",
    url: "http://localhost:5501",
  };
  const dependencyServices = [
    { name: "Jaeger", url: "http://localhost:16686/search" },
    { name: "Seller Mock Engine", url: "http://localhost:7202/health-self" },
    {
      name: "Protocol Server Engine",
      url: "http://localhost:7201/health-self",
    },
  ];

  try {
    const healthResponse = await checkHealth(
      currentService,
      dependencyServices
    );
    const textResponse = JsonResponseToText(healthResponse);
    res.status(healthResponse.statusCode).send(textResponse);
  } catch (error) {
    res.status(500).json({
      error: "Failed to perform health check",
      details: error.message,
    });
  }
}

module.exports = { healthController };
