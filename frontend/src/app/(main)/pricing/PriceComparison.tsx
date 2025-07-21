"use client";

import { Card, CardContent } from "@/components/ui/card";

export function PricingComparison() {
  const pricingOptions = [
    {
      title: "Manual Editing",
      price: "$50-100/hour",
      subtitle: "Plus revision time",
      isExpensive: true,
    },
    {
      title: "Freelancer Platform",
      price: "$25-75/clip",
      subtitle: "3-7 day turnaround",
      isExpensive: true,
    },
    {
      title: "Our Infrastructure",
      price: "~$2.80/user",
      subtitle: "Per month",
      isExpensive: false,
    },
    {
      title: "Snipmatic Pro",
      price: "$5/month",
      subtitle: "Instant results",
      isExpensive: false,
      isHighlighted: true,
    },
  ];

  const infrastructureCosts = [
    { name: "AWS GPU Processing (g4dn.xlarge)", cost: "$1.20" },
    { name: "Database (PostgreSQL + Redis)", cost: "$0.45" },
    { name: "Storage (S3 + CloudFront CDN)", cost: "$0.35" },
    { name: "Video Processing API (FFmpeg)", cost: "$0.25" },
    { name: "Email Service (Resend)", cost: "$0.15" },
    { name: "Monitoring & Security", cost: "$0.40" },
  ];

  return (
    <div className="bg-muted/50 rounded-3xl p-8 mb-12 border backdrop-blur-sm">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Why Snipmatic Pro Makes Sense
        </h2>

        <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
          Creating clips manually costs{" "}
          <span className="font-bold text-destructive">$50+ per hour</span> vs
          our infrastructure costs
        </p>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {pricingOptions.map((option, index) => (
            <div key={option.title}>
              <Card
                className={`relative overflow-hidden transition-all duration-300 ${
                  option.isHighlighted
                    ? "ring-2 ring-primary/20 bg-primary/5"
                    : "hover:shadow-lg"
                }`}
              >
                {option.isHighlighted && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary" />
                )}

                <CardContent className="p-6 text-center space-y-3">
                  <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {option.title}
                  </div>

                  <div
                    className={`text-2xl font-bold ${
                      option.isExpensive
                        ? "text-destructive"
                        : option.isHighlighted
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {option.price}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {option.subtitle}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div>
          <Card className="text-left overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-6 text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Our Monthly Infrastructure Costs Per User
              </h3>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {infrastructureCosts.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.name}
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {item.cost}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center font-bold text-lg mb-4">
                <span>Total Infrastructure Cost:</span>
                <span className="text-primary font-mono text-xl">
                  $2.80/month
                </span>
              </div>

              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-sm text-muted-foreground">
                  <span className="font-bold text-primary">
                    $2.20 profit margin
                  </span>{" "}
                  helps us improve the service, add features, and provide
                  support
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
