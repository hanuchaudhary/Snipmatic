import React from "react";

import { IconUpload } from "@tabler/icons-react";

import { Button } from "../ui/button";

export const CreateClip = () => {
  const [videoLink, setVideoLink] = React.useState("");
  return (
    <div className="min-h-[30vh] pt-16">
      <div className="w-full flex items-center justify-center pb-16">
        <div className="flex items-center justify-center gap-2 border rounded-[20px] w-fit pl-4 pr-1 py-1 font-sans text-sm">
          <p>
            You are using the Free Plan of OpusClip with watermark and limited
            features.
          </p>
          <Button className="font-normal" variant={"secondary"}>Upgrade</Button>
        </div>
      </div>
      <h2 className="text-2xl pb-3">Snipmatic</h2>
      <div className="relative">
        <img
          src="/youtube-icon.png"
          alt="YouTube Icon"
          className="absolute top-1/2 -translate-y-1/2 left-0 w-10"
        />
        <input
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
          placeholder="Paste a YouTube link or upload a video"
          autoFocus
          className="w-full border-t-0 focus-visible:ring-0 focus:ring-0 focus-visible:outline-0 bg-none text-[1.9rem] mask-r-from-0% pl-12 border-b"
        />
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full mt-2 absolute right-0 top-1/2 -translate-y-1/2">
          Get Clips
        </button>
      </div>
      <div className="flex gap-4 mt-4">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary cursor-pointer">
          <IconUpload className="size-5" /> Upload
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary cursor-pointer">
          <img src="/gdrive-icon.png" alt="Gdrive Icon" className="w-5" />
          Google Drive
        </button>
      </div>
    </div>
  );
};
