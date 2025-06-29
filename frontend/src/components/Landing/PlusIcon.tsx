import Image from "next/image";
import React from "react";

export default function PlusIcon() {
  return (
    <Image
      src={"/plus.svg"}
      alt="plus"
      height={31}
      width={31}
    />
  );
}
