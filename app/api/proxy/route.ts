// app/api/proxy/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
      const body = await req.json();
      console.log("Received request:", body); // Log the request body
  
      const response = await fetch("https://sangam.xendrax.in/webhook/b7d1b709-ac08-4a54-9450-7f02020ec6fd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
      console.log("Response from n8n:", data); // Log the response from n8n
  
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      console.error("Error in proxy request:", error);
      return NextResponse.json({ error: "Error forwarding request to n8n" }, { status: 500 });
    }
  }
  