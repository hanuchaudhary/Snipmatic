"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { getYouTubeThumbnail } from "@/lib/utils";
import { IconTrophy, IconMedal, IconLoader2 } from "@tabler/icons-react";
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
      return <IconTrophy className="h-8 w-8 text-yellow-500" />;
    case 2:
      return <IconMedal className="h-7 w-7 text-gray-400" />;
    case 3:
      return <IconMedal className="h-6 w-6 text-amber-700" />;
    default:
      return (
        <div className="h-8 w-8 flex items-center justify-center font-bold text-muted-foreground">
          {rank}
        </div>
      );
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <IconTrophy className="h-12 w-12 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold font-instrumental">
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
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.youtubeUrl}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 ${
                    index === 0
                      ? "border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                      : index === 1
                      ? "border-gray-400/50 shadow-lg shadow-gray-400/20"
                      : index === 2
                      ? "border-amber-700/50 shadow-lg shadow-amber-700/20"
                      : ""
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4 md:p-6">
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>

                      {/* Thumbnail */}
                      <a
                        href={entry.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 relative group"
                      >
                        <div className="w-32 h-20 md:w-48 md:h-28 rounded-lg overflow-hidden">
                          <img
                            src={
                              entry.thumbnailUrl ||
                              getYouTubeThumbnail(entry.youtubeUrl) ||
                              "/placeholder.jpg"
                            }
                            alt={entry.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                          </svg>
                        </div>
                      </a>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <a
                          href={entry.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <h3 className="font-jost font-semibold text-base md:text-lg line-clamp-2 group-hover:text-orange-500 transition-colors">
                            {entry.title}
                          </h3>
                        </a>
                        <p className="text-sm text-muted-foreground mt-1 font-jost">
                          Processed{" "}
                          <span className="font-semibold text-orange-500">
                            {entry.count}
                          </span>{" "}
                          {entry.count === 1 ? "time" : "times"}
                        </p>
                      </div>

                      {/* Count Badge */}
                      <div className="flex-shrink-0">
                        <div
                          className={`px-4 py-2 rounded-full font-bold font-jost ${
                            index === 0
                              ? "bg-yellow-500/20 text-yellow-500"
                              : index === 1
                              ? "bg-gray-400/20 text-gray-400"
                              : index === 2
                              ? "bg-amber-700/20 text-amber-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {entry.count}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
