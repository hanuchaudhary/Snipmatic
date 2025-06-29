import React from "react";

export default function Pill({
  classname,
  text,
}: {
  classname: string;
  text: string;
}) {
  return (
    <span className={`${classname} rounded-full px-4 py-1 md:text-sm text-xs leading-none`}>
      {text}
    </span>
  );
}
