"use client";

export default function HomePage() {
  const cards = [
    { title: "Dashboard", subtitle: "Band overview & quick links", href: "/dashboard" },
    { title: "Songs", subtitle: "Song library & details", href: "/songs" },
    { title: "Studio", subtitle: "Routing, scenes, and tools", href: "/studio" },
    { title: "Setlist Builder", subtitle: "Drag, order, and time your show", href: "/setlist" },
    { title: "Go Live", subtitle: "Trigger BPM & cues to Reaper", href: "/live" },
    { title: "Stems", subtitle: "Fadr.com stem splitting workflow", href: "/stems" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Dirty Diapers Studio</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <a key={card.href} href={card.href} className="card">
            <div className="card-title">{card.title}</div>
            <div className="card-subtitle">{card.subtitle}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
