"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z.object({
  url: z.string().url("Please enter a valid video URL").min(1, "URL is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  aspectRatio: z.enum(["original", "vertical", "square"]),
  subtitles: z.boolean(),
  clipWithAI: z.boolean(),
  multipleClips: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DashboardPage() {
  const [clipWithAI, setClipWithAI] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      url: "",
      startTime: "00:00:00",
      endTime: "00:00:00",
      aspectRatio: "original",
      subtitles: false,
      clipWithAI: false,
      multipleClips: false,
    },
    resolver: zodResolver(formSchema),
  });

  const watchUrl = watch("url");
  const watchMultiple = watch("multipleClips");

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await axios.post("/api/process-video", {
        ...data,
        clipWithAI,
      });

      toast.success("Processing started", {
        description: "Your video is being processed",
      });

      console.log("Response data: ", response.data);
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong while processing",
      });
    }
  };

  return (
    <div className="min-h-screen md:pt-0 pt-20 p-4 flex items-center justify-center">
      <div className="container max-w-2xl mx-auto">
        <h1 className="text-center md:text-4xl text-2xl md:mb-8 mb-6 font-serif-instrumental font-thin">
          Ready to Snip Something Viral?
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="space-y-6">
              {/* Video URL */}
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="url"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="url"
                      type="url"
                      placeholder="Paste any YouTube link..."
                      className="border-none focus-visible:ring-0"
                    />
                  )}
                />
                {errors.url && (
                  <p className="text-sm text-destructive">{errors.url.message}</p>
                )}
              </div>

              {/* Clip with AI Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="clipWithAI">Auto Clip with AI</Label>
                <Controller
                  control={control}
                  name="clipWithAI"
                  render={({ field }) => (
                    <Switch
                      id="clipWithAI"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setClipWithAI(checked);
                      }}
                    />
                  )}
                />
              </div>

              {/* Multiple Clips (AI Only) */}
              <div className="flex items-center justify-between">
                <Label htmlFor="multipleClips">Generate Multiple Clips</Label>
                <Controller
                  control={control}
                  name="multipleClips"
                  render={({ field }) => (
                    <Switch
                      id="multipleClips"
                      checked={field.value}
                      disabled={!clipWithAI}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Controller
                    control={control}
                    name="startTime"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Start - 00:00:00"
                        disabled={clipWithAI}
                        className="flex-1 font-mono"
                      />
                    )}
                  />
                  <span className="text-muted-foreground">to</span>
                  <Controller
                    control={control}
                    name="endTime"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="End - 00:00:00"
                        disabled={clipWithAI}
                        className="flex-1 font-mono"
                      />
                    )}
                  />
                </div>
                {clipWithAI && (
                  <p className="text-sm text-muted-foreground">
                    Time range is auto-detected by Snipmatic AI.
                  </p>
                )}
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <Label>Clip Format</Label>
                <Controller
                  control={control}
                  name="aspectRatio"
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {[
                        { value: "original", label: "Original" },
                        { value: "vertical", label: "Vertical (9:16)" },
                        { value: "square", label: "Square (1:1)" },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          size={"lg"}
                          variant={
                            field.value === option.value ? "default" : "outline"
                          }
                          onClick={() => field.onChange(option.value)}
                          className="flex-1"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Subtitles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtitles">Add Subtitles</Label>
                  <Controller
                    control={control}
                    name="subtitles"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch
                          id="subtitles"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="subtitles" className="text-sm">
                          English only
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="w-full flex items-center justify-center mt-4">
            <button
              style={{
                boxShadow: "rgba(255, 255, 255, 0.16) 0px 2px 6px -2px inset",
              }}
              className="border transition-transform px-7 py-3 rounded-xl font-semibold bg-neutral-100 text-primary-foreground cursor-pointer flex items-center gap-2"
              type="submit"
            >
              Process Video
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
