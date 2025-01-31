"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import Image from "next/image";

type Tweet = {
  id: string;
  text: string;
  created_at: string;
  author: {
    name: string;
    username: string;
    profile_image_url: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TrendingTweets() {
  console.log('ok at least i am rendered');
  const { data, error, isLoading } = useSWR("/api/getTweets", fetcher, {
    refreshInterval: 60000,
  });

  if (error) return <p className="text-red-500">Failed to load tweets.</p>;

  const tweets: Tweet[] =
    data?.data?.map((tweet: any) => ({
      ...tweet,
      author: data.includes?.users.find((user: any) => user.id === tweet.author_id),
    })) || [];

  return (
    <div className="grid sm:grid-cols-2 gap-4 w-full p-4 bg-white dark:bg-zinc-900 shadow rounded-lg">
      <h2 className="text-lg font-bold mb-4">Trending News from Twitter</h2>

      {isLoading ? (
        <p>Loading trending tweets...</p>
      ) : (
        tweets.map((tweet, index) => (
          <motion.div
            key={tweet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            className={index > 1 ? "hidden sm:block" : "block"}
          >
            <div className="flex items-start gap-4 p-3 border rounded-xl">
              <div className="relative size-12 rounded-full overflow-hidden">
                <Image
                  src={tweet.author?.profile_image_url}
                  alt={tweet.author?.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tweet.author?.name}</span>
                  <span className="text-gray-500">@{tweet.author?.username}</span>
                </div>
                <p className="text-gray-800 dark:text-gray-300">{tweet.text}</p>
                <span className="text-sm text-gray-400">
                  {new Date(tweet.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
