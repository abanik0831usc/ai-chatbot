import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { experimental_generateImage as generateImage } from "ai";
import { getChatById, saveMessages, saveChat } from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { imageGenerationModel } from "@/lib/ai";


const STABILITY_API_URL = "https://api.stability.ai/v2beta/stable-image/generate/sd3";
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { chatId, prompt, n = 1, size = "1024x1024" } = body;
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    let chat = await getChatById({ id: chatId });

    if (!chat) {
      await saveChat({
        id: chatId,
        userId: session.user.id,
        title: prompt,
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("output_format", "png");
    formData.append("width", "1024");
    formData.append("height", "1024");
    formData.append("cfg_scale", "7.5");
    formData.append("samples", n.toString());

    const [dalleResponse, stabilityResponse] = await Promise.all([
      generateImage({
        model: imageGenerationModel,
        prompt,
        n,
        size,
        aspectRatio: "1:1",
        seed: Math.floor(Math.random() * 10000),
      }),
      fetch(STABILITY_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          Accept: "application/json",
        },
        body: formData,
      }),
    ]);


    if (!dalleResponse.images || dalleResponse.images.length === 0) {
      return NextResponse.json({ error: "No images generated" }, { status: 500 });
    }

    // Extract base64 images correctly
    const dalleImages = dalleResponse.images.map(({ base64 }) =>
      `data:image/png;base64,${base64}`
    );

    const stabilityData = await stabilityResponse.json();
    const stabilityImages = stabilityData.image
  ? [`data:image/png;base64,${stabilityData.image}`]
  : [];

    await saveMessages({
      messages: [
        {
          id: generateUUID(),
          chatId,
          role: "assistant",
          content: JSON.stringify({ dalle: dalleImages, stability: stabilityImages }),
          createdAt: new Date(),
        },
      ],
    });

    return NextResponse.json({ images: { dalle: dalleImages, stability: stabilityImages } });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
