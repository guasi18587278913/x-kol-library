import { NextRequest, NextResponse } from "next/server";
import { getLatestTweets } from "@/lib/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);
    const offset = Math.max(Number(searchParams.get("offset") || 0), 0);

    const tweets = await getLatestTweets(limit, offset);

    return NextResponse.json(
      { data: { tweets }, total: tweets.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch tweets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweets" },
      { status: 500 }
    );
  }
}
