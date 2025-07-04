import { Bot } from "lucide-react";
import Link from "next/link";

import { getLighthouseConfig } from "@/actions/lighthouse/lighthouse";
import { CacheService } from "@/lib/lighthouse/cache";

interface BannerConfig {
  message: string;
  href: string;
  gradient: string;
  animate?: boolean;
}

const renderBanner = ({
  message,
  href,
  gradient,
  animate = false,
}: BannerConfig) => (
  <Link href={href} className="mb-4 block w-full">
    <div
      className={`w-full rounded-lg ${gradient} shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-opacity-50`}
    >
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Bot
              size={24}
              className={`text-white ${animate ? "animate-pulse" : ""}`}
            />
          </div>
          <div className="text-left">
            <p className="text-xl font-semibold text-white">{message}</p>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export const LighthouseBanner = async () => {
  try {
    // Check if Lighthouse is configured
    const lighthouseConfig = await getLighthouseConfig();

    if (!lighthouseConfig?.attributes) {
      return renderBanner({
        message: "Enable Lighthouse to Secure Your Cloud With AI Insights",
        href: "/lighthouse/config",
        gradient:
          "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:ring-green-500/50 dark:from-green-600 dark:to-blue-600 dark:hover:from-green-700 dark:hover:to-blue-700 dark:focus:ring-green-400/50",
      });
    }

    // Check if recommendation exists
    const cachedRecommendations = await CacheService.getRecommendations();

    if (
      cachedRecommendations.success &&
      cachedRecommendations.data &&
      cachedRecommendations.data.trim().length > 0
    ) {
      return renderBanner({
        message: cachedRecommendations.data,
        href: "/lighthouse",
        gradient:
          "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500/50 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 dark:focus:ring-blue-400/50",
      });
    }

    // Check if recommendation is being processed
    const isProcessing = await CacheService.isRecommendationProcessing();

    if (isProcessing) {
      return renderBanner({
        message: "Lighthouse Is Reviewing Your Findings for Insights",
        href: "/lighthouse",
        gradient:
          "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 focus:ring-orange-500/50 dark:from-orange-600 dark:to-yellow-600 dark:hover:from-orange-700 dark:hover:to-yellow-700 dark:focus:ring-orange-400/50",
        animate: true,
      });
    }

    // Lighthouse configured but no recommendation and not processing - don't show banner
    return null;
  } catch (error) {
    console.error("Error getting banner state:", error);
    return null;
  }
};
