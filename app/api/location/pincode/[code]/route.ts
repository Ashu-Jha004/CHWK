import { NextResponse } from "next/server";

// Next.js 15+ requires params to be awaited
export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Input validation
    if (!code) {
      return NextResponse.json(
        { error: "Pincode is required" },
        { status: 400 }
      );
    }

    // Sanitize and validate format
    const sanitizedCode = code.trim();
    if (!/^\d{6}$/.test(sanitizedCode)) {
      return NextResponse.json(
        { error: "Invalid pincode format. Must be 6 digits." },
        { status: 400 }
      );
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${sanitizedCode}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`External API error: ${response.status} ${response.statusText}`);
        return NextResponse.json(
          { error: "External service unavailable" },
          { status: 503 }
        );
      }

      const data = await response.json();

      // Validate response structure
      if (!data || !Array.isArray(data) || data.length === 0) {
        return NextResponse.json(
          { error: "Invalid response from external service" },
          { status: 502 }
        );
      }

      // Check if pincode was found
      if (data[0]?.Status === "Error" || !data[0]?.PostOffice) {
        return NextResponse.json(
          { error: "Not found", message: "Pincode not found in database" },
          { status: 404 }
        );
      }

      // Validate data structure
      const postOffice = data[0].PostOffice[0];
      if (!postOffice?.District || !postOffice?.State) {
        return NextResponse.json(
          { error: "Incomplete data", message: "Location data is incomplete" },
          { status: 502 }
        );
      }

      // Success response with caching headers
      return NextResponse.json(
        {
          city: postOffice.District,
          state: postOffice.State,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("Pincode API timeout");
        return NextResponse.json(
          { error: "Request timeout", message: "Location service is taking too long to respond" },
          { status: 504 }
        );
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("Pincode route error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while fetching location data"
      },
      { status: 500 }
    );
  }
}
