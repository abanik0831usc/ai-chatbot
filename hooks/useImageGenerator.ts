import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchGenerateImage(
  url: string,
  { arg }: { arg: { chatId: string; prompt: string; n?: number; size?: string } }
) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error("Failed to generate images");
  }

  const data = await response.json();
  return data.images;
}

export function useGenerateImage() {
  const { trigger, isMutating } = useSWRMutation(
    "/api/generate-image",
    fetchGenerateImage
  );

  const generateImage = async (
    chatId: string,
    prompt: string,
    setMessages: (messages: any) => void
  ) => {
    if (!prompt.trim()) return;

    const skeletonMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "loading",
      isLoading: true,
    };

    toast.promise(
      trigger({ chatId, prompt, n: 1, size: "1024x1024" }),
      {
        loading: "Generating images from DALL·E and Stable Diffusion...",
        success: (images) => {
          if (!images.dalle.length && !images.stability.length) {
            return "No images were generated.";
          }

          const combinedMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: JSON.stringify(images), 
            source: "DALL·E & Stable Diffusion",
            createdAt: new Date(),
          };

          setMessages((prev: any) => [...prev, combinedMessage]);

          return "Images generated!";
        },
        error: "Failed to generate images",
      }
    );
  };

  return { generateImage, isMutating };
}
