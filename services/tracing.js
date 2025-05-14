"use strict";
require("dotenv").config();
const log = require("../utils/logger");
const logger = log.init();
logger.info("Starting opentelemetry tracing");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const { Resource } = require("@opentelemetry/resources");
const { ATTR_SERVICE_NAME } = require("@opentelemetry/semantic-conventions");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");

const resource = new Resource({
  [ATTR_SERVICE_NAME]: "mock-server-utility",
});

const traceExporter = new OTLPTraceExporter({
  url: "http://jaeger:4318/v1/traces", // Default OTLP endpoint
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  resource,
});

sdk.start();

// running outside the container and tracing it in the jaeger container
// const fs = require("fs");
// const yaml = require("js-yaml");
// const fisConfig = yaml.load(fs.readFileSync("./FIS/FIS.yaml", "utf8"));

// if (fisConfig.tracing?.enabled) {
//   const jaegerConfig = fisConfig.tracing.jaeger;

//   const resource = new Resource({
//     [ATTR_SERVICE_NAME]: jaegerConfig.service_name,
//   });

//   const traceExporter = new OTLPTraceExporter({
//     url: jaegerConfig.endpoint || "http://jaeger:4318/v1/traces", // Default OTLP endpoint
//   });

//   const sdk = new NodeSDK({
//     traceExporter,
//     instrumentations: [getNodeAutoInstrumentations()],
//     resource,
//   });

//   sdk.start();
// }
