import { type NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug, getKOLsByCategory, getKOLCount } from "@/lib/queries";

// Revalidate every hour
export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const category = await getCategoryBySlug(slug);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

    const [kols, total] = await Promise.all([
      getKOLsByCategory(slug, limit, offset),
      getKOLCount(slug),
    ]);

    return NextResponse.json(
      {
        data: { category, kols },
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch category detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch category detail" },
      { status: 500 }
    );
  }
}
