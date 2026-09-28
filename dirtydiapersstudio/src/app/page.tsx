"use client";

export default function HomePage() {
  const cards = [
    { title: "Dashboard", subtitle: "Band overview & quick links", href: "/dashboard" },
    { title: "Songs", subtitle: "Song library & details", href: "/songs" },
    { title: "Studio", subtitle: "Routing, scenes, and tools", href: "/studio" },
    { title: "Setlist Builder", subtitle: "Drag, order, and time your show", href: "/setlist" },
    { title: "Go Live", subtitle: "Trigger BPM & cues to Reaper", href: "/live" },
    { title: "Stems", subtitle: "Fadr.com stem splitting workflow", href: "/stems" },

    // 👇 New mobile route link
    { title: "Mobile Studio", subtitle: "Dirty Diaperz Studio Mobile automation engine", href: "/mobile/studio" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Dirty Diaperz Studio</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="text-xl font-bold text-pink-400 mb-2">{card.title}</div>
            <div className="text-gray-400">{card.subtitle}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
