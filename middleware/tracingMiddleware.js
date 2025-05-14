const { trace } = require("@opentelemetry/api");
const { get } = require("lodash");

/**
 * Middleware factory that creates a tracing span with optional dot-notated paths.
 *
 * @param transaction_id_path - Dot path to transaction_id in req.body (default: 'context.transaction_id')
 * @param session_id - Dot path to transaction_id in req.body (default: 'context.transaction_id')
 * @param bap_id_path - Dot path to bap_id in req.body (default: 'context.bap_id')
 * @param bpp_id_path - Dot path to bpp_id in req.body (default: 'context.bpp_id')
 * @returns Express middleware
 */
function otelTracing(
  transaction_id_path = "context.transaction_id",
  session_id_path = "context.session_id",
  bap_id_path = "context.bap_id",
  bpp_id_path = "context.bpp_id"
) {
  return (req, res, next) => {
    const transaction_id = get(req, transaction_id_path);
    const session_id = get(req, session_id_path);
    const bap_id = get(req, bap_id_path);
    const bpp_id = get(req, bpp_id_path);
    
    const tracer = trace.getTracer(
      process.env.SERVICE_NAME || "ondc-api-mock-tracer"
    );

    const span = tracer.startSpan("trace_span", {
      attributes: {
        transaction_id: transaction_id || "",
        session_id: session_id || "",
        bap_id: bap_id || "",
        bpp_id: bpp_id || "",
      },
    });

    span.end();

    next();
  };
}

module.exports = otelTracing;
