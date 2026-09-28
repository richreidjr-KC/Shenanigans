"use client";

import { useEffect } from "react";

export default function RedirectToNetlify() {
  useEffect(() => {
    window.location.href = "https://dirtydiaperzsetlist.netlify.app/";
  }, []);

  return <p>Loading Setlist Builder…</p>;
}
