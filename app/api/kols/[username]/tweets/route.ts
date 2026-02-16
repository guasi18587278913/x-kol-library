import { type NextRequest, NextResponse } from "next/server";
import { getKOLByUsername, getTweetsByKOL, getTweetCount } from "@/lib/queries";

// Revalidate every hour
export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    const kol = await getKOLByUsername(username);
    if (!kol) {
      return NextResponse.json(
        { error: "KOL not found" },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

    const [tweets, total] = await Promise.all([
      getTweetsByKOL(username, limit, offset),
      getTweetCount(username),
    ]);

    return NextResponse.json(
      {
        data: {
          kol: { username: kol.username, display_name: kol.display_name },
          tweets,
        },
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch KOL tweets:", error);
    return NextResponse.json(
      { error: "Failed to fetch KOL tweets" },
      { status: 500 }
    );
  }
}
