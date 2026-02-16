import { type NextRequest, NextResponse } from "next/server";
import { searchKOLs, searchTweets } from "@/lib/queries";

// No ISR caching for search - results depend on query
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json(
        { error: "Missing search query parameter: q" },
        { status: 400 }
      );
    }

    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);
    const type = searchParams.get("type") || "all"; // "all" | "kols" | "tweets"

    const searchKOLsPromise =
      type === "all" || type === "kols" ? searchKOLs(q, limit) : null;
    const searchTweetsPromise =
      type === "all" || type === "tweets" ? searchTweets(q, limit) : null;

    const [kols, tweets] = await Promise.all([
      searchKOLsPromise,
      searchTweetsPromise,
    ]);

    const data: { kols?: Awaited<ReturnType<typeof searchKOLs>>; tweets?: Awaited<ReturnType<typeof searchTweets>> } = {};
    if (kols) data.kols = kols;
    if (tweets) data.tweets = tweets;

    return NextResponse.json(
      { data, query: q, type },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
