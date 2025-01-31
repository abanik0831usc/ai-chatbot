import { NextRequest, NextResponse } from "next/server";

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_API_URL = "https://api.twitter.com/2/tweets/search/recent";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(
      `${TWITTER_API_URL}?query=breaking news OR trending -is:retweet&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=name,username,profile_image_url&max_results=10`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    console.log('tweet', response);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch tweets" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
