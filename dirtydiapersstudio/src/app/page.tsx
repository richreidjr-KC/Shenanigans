"use client";

const links = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Songs", href: "/songs" },
  { title: "Studio", href: "/studio" },
  { title: "Setlist Builder", href: "/setlist" },
  { title: "Legacy Setlist Builder", href: "/setlist/legacy" },
  { title: "Go Live", href: "/live" },
  { title: "Stems", href: "/stems" },
  { title: "Mobile Studio", href: "/mobile/studio" },
];

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Dirty Diaperz Studio
      </h1>

      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="block w-full border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition"
        >
          <div className="text-lg font-medium">{link.title}</div>
        </a>
      ))}
    </div>
  );
}
