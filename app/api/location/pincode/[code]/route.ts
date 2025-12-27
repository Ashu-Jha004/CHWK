import { NextResponse } from "next/server";

// Next.js 15+ requires params to be awaited
export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> } // Change to Promise
) {
  const { code } = await params; // Await it here

  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${code}`
    );
    const data = await response.json();

    // Check if the external API actually found the data
    if (!data || data[0].Status === "Error") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      city: data[0].PostOffice[0].District,
      state: data[0].PostOffice[0].State,
    });
  } catch (error) {
    return NextResponse.json({ error: "API down" }, { status: 500 });
  }
}
