"use client";

import dynamic from "next/dynamic";

const LazyTiptap = dynamic(() => import("./tiptap"), {
  ssr: false,
});

export default LazyTiptap;
