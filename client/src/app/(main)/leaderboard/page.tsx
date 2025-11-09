"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getYouTubeThumbnail, cn } from "@/lib/utils";
import { IconTrophy, IconMedal, IconLoader2, IconExternalLink } from "@tabler/icons-react";
import axios from "axios";

interface LeaderboardEntry {
  youtubeUrl: string;
  title: string;
  thumbnailUrl: string | null;
  count: number;
  latestDate: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <IconTrophy className="h-6 w-6 text-white" />;
    case 2:
      return <IconMedal className="h-6 w-6 text-white" />;
    case 3:
      return <IconMedal className="h-6 w-6 text-white" />;
    default:
      return null;
  }
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/leaderboard");
        if (response.data.success) {
          setLeaderboard(response.data.leaderboard);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 mt-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-2xl md:text-4xl font-semibold font-instrumental">
              Top 5 <span className="text-orange-500">Viral</span> Videos
            </h1>
          </div>
          <p className="text-muted-foreground text-lg font-jost">
            Most popular videos processed by our community
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <IconLoader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-muted-foreground font-jost">
              Loading leaderboard...
            </p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg font-jost">
              No videos in the leaderboard yet. Be the first to create clips!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.youtubeUrl}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div
                  className={cn(
                    "cursor-pointer w-full rounded-3xl overflow-hidden shadow-lg border bg-muted hover:shadow-2xl transition-all duration-300 relative",
                  )}
                >
                  <div className="absolute top-3 left-3 z-10">
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-full shadow-lg backdrop-blur-sm",
                        index === 0 && "bg-yellow-500/90 p-2",
                        index === 1 && "bg-gray-400/90 p-2",
                        index === 2 && "bg-amber-700/90 p-2",
                        index > 2 && "bg-black/60 p-2 px-3"
                      )}
                    >
                      {index < 3 ? (
                        getRankIcon(index + 1)
                      ) : (
                        <span className="text-white font-bold text-lg">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Count Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <div
                      className={cn(
                        "px-4 py-2 rounded-full font-bold font-jost shadow-lg backdrop-blur-sm",
                        index === 0 && "bg-yellow-500/90 text-white",
                        index === 1 && "bg-gray-400/90 text-white",
                        index === 2 && "bg-amber-700/90 text-white",
                        index > 2 && "bg-black/60 text-white"
                      )}
                    >
                      {entry.count}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <a
                    href={entry.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative w-full aspect-[16/9]">
                      <img
                        src={
                          entry.thumbnailUrl ||
                          getYouTubeThumbnail(entry.youtubeUrl) ||
                          "/placeholder.jpg"
                        }
                        alt={entry.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          if (
                            e.currentTarget.src !==
                            getYouTubeThumbnail(entry.youtubeUrl)
                          ) {
                            e.currentTarget.src = getYouTubeThumbnail(
                              entry.youtubeUrl
                            );
                          } else {
                            e.currentTarget.src = "/placeholder.jpg";
                          }
                        }}
                      />
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white">
                          <IconExternalLink className="w-6 h-6" />
                          <span className="font-jost font-semibold">
                            Watch on YouTube
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* Card Content */}
                  <div className="p-4">
                    <a
                      href={entry.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <h3 className="font-jost font-semibold text-base line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
                        {entry.title}
                      </h3>
                    </a>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="font-jost">
                        Processed{" "}
                        <span className="font-semibold text-orange-500">
                          {entry.count}
                        </span>{" "}
                        {entry.count === 1 ? "time" : "times"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
