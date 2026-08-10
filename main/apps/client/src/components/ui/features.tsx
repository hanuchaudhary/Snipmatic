import { TooltipButton } from "./tooltip-button"

interface FeaturesType {
    title: string,
    tooltipText: string
    icon: string,
    isReady: boolean
}
interface FeaturesType {
    title: string
    tooltipText: string
    icon: string
    isReady: boolean
}

export const featuresData: FeaturesType[] = [
    {
        title: "Viral Detection",
        tooltipText: "AI automatically finds the most engaging and viral-worthy moments from your podcast.",
        icon: "/favicon.svg",
        isReady: false,
    },
    {
        title: "AI Captions",
        tooltipText: "Generate accurate captions automatically with customizable styles, animations, and highlighted words.",
        icon: "/logo.png",
        isReady: false,
    },
    {
        title: "Smart Tracking",
        tooltipText: "Track faces, people, and moving subjects to keep the important content in frame.",
        icon: "/youtube-icon.png",
        isReady: false,
    },
    {
        title: "AI Editing",
        tooltipText: "Let AI analyze your content and create optimized short-form clips from your long-form video.",
        icon: "/gdrive-icon.png",
        isReady: false,
    },
    {
        title: "Background Music",
        tooltipText: "Add background music with automatic volume ducking when someone is speaking.",
        icon: "/logo.png",
        isReady: false,
    },
    {
        title: "Custom Subtitles",
        tooltipText: "Customize fonts, colors, animations, positioning, and subtitle styles.",
        icon: "/logo.png",
        isReady: false,
    },
    {
        title: "Multi-Platform",
        tooltipText: "Export your clips in formats optimized for TikTok, Reels, Shorts, Facebook, and more.",
        icon: "/gdrive-icon.png",
        isReady: false,
    },
]

export const Features = () => {
    return <div className="md:grid md:grid-cols-7 flex md:px-8 gap-6 pb-10 pt-20 w-full overflow-x-auto scrollbar-hidden">
        {
            featuresData.map((feature) => (
                <div>
                    <TooltipButton tooltipText={feature.tooltipText}>
                        <div>
                            <button disabled={!feature.isReady} className="bg-secondary rounded-full disabled:opacity-45 disabled:cursor-not-allowed p-2 size-12">
                                <img src={feature.icon} alt={feature.title[0]} className="w-10" />
                            </button>
                            <p className="text-sm">
                                {feature.title}
                            </p>
                        </div>
                    </TooltipButton>
                </div>
            ))
        }
    </div>
}