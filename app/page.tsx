"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ---------------- AUTH SESSION ----------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ---------------- FETCH BOOKMARKS ----------------
  const fetchBookmarks = async () => {
    if (!session) return;

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", session.user.id) // private per user
      .order("uuid", { ascending: false });

    if (error) {
      console.log("Fetch error:", error);
    } else if (data) {
      setBookmarks(data);
    }
  };

  useEffect(() => {
    if (!session) return;

    fetchBookmarks();

    // REALTIME
    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // ---------------- LOGIN / LOGOUT ----------------
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // ---------------- ADD / UPDATE ----------------
  const handleAddOrUpdate = async () => {
    if (!title || !url) {
      alert("Fill all fields!");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("bookmarks")
        .update({ text: title, url: url })
        .eq("uuid", editingId);

      if (error) console.log(error);

      setEditingId(null);
    } else {
      const { error } = await supabase.from("bookmarks").insert([
        {
          text: title,
          url: url,
          user_id: session.user.id,
        },
      ]);

      if (error) console.log(error);
    }

    setTitle("");
    setUrl("");
    fetchBookmarks();
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("uuid", id);

    if (error) console.log(error);

    fetchBookmarks();
  };

  // ---------------- EDIT ----------------
  const handleEdit = (bookmark: any) => {
    setTitle(bookmark.text);
    setUrl(bookmark.url);
    setEditingId(bookmark.uuid);
  };

  // ---------------- UI ----------------
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <h1 className="text-4xl mb-6 font-bold">Smart Bookmark App</h1>
        <button
          onClick={handleLogin}
          className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-2">Smart Bookmark App</h1>
      <p className="mb-4 text-gray-400">
        Logged in as: {session.user.email}
      </p>

      <button
        onClick={handleLogout}
        className="bg-red-500 px-4 py-2 rounded mb-6 hover:bg-red-600 transition"
      >
        Logout
      </button>

      {/* FORM */}
      <div className="mb-8 flex gap-4">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-800 p-2 rounded w-1/4"
        />
        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-gray-800 p-2 rounded w-1/3"
        />
        <button
          onClick={handleAddOrUpdate}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {bookmarks.map((b) => (
          <div
            key={b.uuid}
            className="bg-gray-900 p-4 rounded flex justify-between items-center"
          >
            <a
              href={b.url}
              target="_blank"
              className="text-blue-400 underline"
            >
              {b.text}
            </a>

            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(b)}
                className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(b.uuid)}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
