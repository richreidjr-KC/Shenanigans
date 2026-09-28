import { supabase } from '@/lib/supabaseClient';

export default async function SongPage({ params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return (
      <div>
        <h1 className="section-title">Song Not Found</h1>
        <div className="card">
          <div className="card-subtitle">Could not load song with id: {params.id}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title">{data["Song"]}</h1>

      <div className="card">
        <div className="card-title">{data["Artist"]}</div>

        <div className="card-subtitle">
          Key: {data["Key"] ?? "N/A"} • BPM: {data["Recording BPM"] ?? "N/A"}
        </div>

        {data["Notes"] && (
          <p style={{ marginTop: 8 }}>
            {data["Notes"]}
          </p>
        )}

        <a href="/live" style={{ marginTop: 12, display: 'inline-block' }}>
          Go Live for this song
        </a>
      </div>
    </div>
  );
}
