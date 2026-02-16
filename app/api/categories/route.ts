import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/queries";

// Revalidate every hour
export const revalidate = 3600;

export async function GET() {
  try {
    const categories = await getAllCategories();

    return NextResponse.json(
      { data: categories, total: categories.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
