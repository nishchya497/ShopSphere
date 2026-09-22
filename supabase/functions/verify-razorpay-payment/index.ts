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

    // Only POST is allowed
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
      // Get Razorpay payment details
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = await req.json();

      // Check required values
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

      // Get Razorpay secret from Supabase secrets
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

      // Razorpay signs this exact message
      const message =
        `${razorpay_order_id}|${razorpay_payment_id}`;

      const encoder = new TextEncoder();

      // Create HMAC-SHA256 key
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

      // Generate signature
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

      // Compare signatures
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

      // Payment verified successfully
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