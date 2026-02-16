import { NextResponse } from "next/server";
import { getKOLByUsername } from "@/lib/queries";

// Revalidate every hour
export const revalidate = 3600;

export async function GET(
  _request: Request,
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

    return NextResponse.json(
      { data: kol },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch KOL detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch KOL detail" },
      { status: 500 }
    );
  }
}
