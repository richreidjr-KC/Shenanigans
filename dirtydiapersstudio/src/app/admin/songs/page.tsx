"use client";

import { useState } from "react";
import { useSongs } from "@/hooks/useSongs";

export default function SongsAdminPage() {
  const {
    songs,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    addSong,
    updateSong,
    deleteSong
  } = useSongs();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    artist: "",
    bpm: "",
    key: "",
    duration: ""
  });

  const startEdit = (song: any) => {
    setEditingId(song.id);
    setEditForm(song);
  };

  const saveEdit = async () => {
    await updateSong(editingId!, editForm);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveNew = async () => {
    await addSong({
      title: newForm.title,
      artist: newForm.artist,
      bpm: newForm.bpm ? Number(newForm.bpm) : null,
      key: newForm.key,
      duration: newForm.duration ? Number(newForm.duration) : null
    });
    setShowNew(false);
    setNewForm({ title: "", artist: "", bpm: "", key: "", duration: "" });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Songs Admin</h1>

      <div className="flex gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search songs…"
          className="p-2 rounded bg-gray-700 text-white w-64"
        />

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowNew(true)}
        >
          Add Song
        </button>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-2 border border-gray-700">Title</th>
            <th className="p-2 border border-gray-700">Artist</th>
            <th className="p-2 border border-gray-700">BPM</th>
            <th className="p-2 border border-gray-700">Key</th>
            <th className="p-2 border border-gray-700">Duration</th>
            <th className="p-2 border border-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => {
            const editing = editingId === song.id;

            return (
              <tr key={song.id} className="bg-gray-900 text-gray-200">
                <td className="p-2 border border-gray-700">
                  {editing ? (
                    <input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="p-1 bg-gray-700 text-white rounded"
                    />
                  ) : (
                    song.title
                  )}
                </td>

                <td className="p-2 border border-gray-700">
                  {editing ? (
                    <input
                      value={editForm.artist}
                      onChange={(e) =>
                        setEditForm({ ...editForm, artist: e.target.value })
                      }
                      className="p-1 bg-gray-700 text-white rounded"
                    />
                  ) : (
                    song.artist
                  )}
                </td>

                <td className="p-2 border border-gray-700">
                  {editing ? (
                    <input
                      value={editForm.bpm ?? ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          bpm: Number(e.target.value)
                        })
                      }
                      className="p-1 bg-gray-700 text-white rounded"
                    />
                  ) : (
                    song.bpm
                  )}
                </td>

                <td className="p-2 border border-gray-700">
                  {editing ? (
                    <input
                      value={editForm.key ?? ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, key: e.target.value })
                      }
                      className="p-1 bg-gray-700 text-white rounded"
                    />
                  ) : (
                    song.key
                  )}
                </td>

                <td className="p-2 border border-gray-700">
                  {editing ? (
                    <input
                      value={editForm.duration ?? ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          duration: Number(e.target.value)
                        })
                      }
                      className="p-1 bg-gray-700 text-white rounded"
                    />
                  ) : (
                    song.duration
                  )}
                </td>

                <td className="p-2 border border-gray-700">
                  {editing ? (
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded"
                        onClick={saveEdit}
                      >
                        Save
                      </button>
                      <button
                        className="px-3 py-1 bg-gray-600 text-white rounded"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-yellow-600 text-white rounded"
                        onClick={() => startEdit(song)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded"
                        onClick={() => deleteSong(song.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-center mt-6 gap-4">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
        >
          Prev
        </button>

        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          Next
        </button>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Add New Song</h2>

            <div className="space-y-3">
              <input
                placeholder="Title"
                value={newForm.title}
                onChange={(e) =>
                  setNewForm({ ...newForm, title: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                placeholder="Artist"
                value={newForm.artist}
                onChange={(e) =>
                  setNewForm({ ...newForm, artist: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                placeholder="BPM"
                value={newForm.bpm}
                onChange={(e) =>
                  setNewForm({ ...newForm, bpm: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                placeholder="Key"
                value={newForm.key}
                onChange={(e) =>
                  setNewForm({ ...newForm, key: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                placeholder="Duration (seconds)"
                value={newForm.duration}
                onChange={(e) =>
                  setNewForm({ ...newForm, duration: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded"
                onClick={() => setShowNew(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={saveNew}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
