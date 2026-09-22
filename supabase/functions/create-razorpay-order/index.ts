const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default {
  async fetch(req: Request) {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method not allowed",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = await req.json();

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return new Response(
          JSON.stringify({
            error: "Missing payment verification details",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

      if (!keySecret) {
        return new Response(
          JSON.stringify({
            error: "Razorpay secret is not configured",
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Create the message Razorpay signs
      const message =
        `${razorpay_order_id}|${razorpay_payment_id}`;

      // Convert secret and message to bytes
      const encoder = new TextEncoder();

      const secretKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(keySecret),
        {
          name: "HMAC",
          hash: "SHA-256",
        },
        false,
        ["sign"]
      );

      // Generate HMAC SHA-256 signature
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        secretKey,
        encoder.encode(message)
      );

      // Convert signature to hexadecimal
      const generatedSignature = Array.from(
        new Uint8Array(signatureBuffer)
      )
        .map((byte) =>
          byte.toString(16).padStart(2, "0")
        )
        .join("");

      // Compare generated signature with Razorpay signature
      if (generatedSignature !== razorpay_signature) {
        return new Response(
          JSON.stringify({
            verified: false,
            error: "Payment signature verification failed",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Payment is verified
      return new Response(
        JSON.stringify({
          verified: true,
          razorpay_order_id,
          razorpay_payment_id,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Payment verification error:",
        error
      );

      return new Response(
        JSON.stringify({
          error: "Internal server error",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};