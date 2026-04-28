import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function findImageUrlFromText(content) {
  const re = /(https?:\/\/[^\s]+)/gi;
  const urls = content.match(re) || [];
  return urls.find((u) => /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(u)) || "";
}

function renderContent(content) {
  const re = /(https?:\/\/[^\s]+)/gi;
  const parts = content.split(re);
  return parts.map((part, idx) => {
    if (/^https?:\/\//i.test(part)) {
      return (
        <a key={`${part}-${idx}`} href={part} target="_blank" rel="noreferrer">
          {part}
        </a>
      );
    }
    return <span key={`${part}-${idx}`}>{part}</span>;
  });
}

function PostCard({ post, meId, onLike, onComment, onDelete, onEdit }) {
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content || "");
  const mine = post.userId?._id === meId || post.userId === meId;
  const canManage = mine || post.viewerCanManage;
  const likedByMe = useMemo(() => {
    if (!meId) return false;
    return (post.likes || []).some((id) => id === meId || id?._id === meId);
  }, [post.likes, meId]);

  return (
    <div className="card post xPost">
      <div className="xPostAvatar">
        <div className="avatar sm">{post.userId?.name?.slice(0, 1)?.toUpperCase() || "?"}</div>
      </div>
      <div className="xPostMain">
        <div className="postHeader xPostHeader">
          <div className="xPostIdentity">
            <span className="postAuthor">{post.userId?.name || "Student"}</span>
            <span className="postMeta">@{(post.userId?.name || "student").toLowerCase().replace(/\s+/g, "")}</span>
            <span className="postMeta">· {new Date(post.createdAt).toLocaleString()}</span>
          </div>
          {canManage ? (
            <div className="row">
              <button
                className="btn ghost btnSmall"
                onClick={() => {
                  setEditText(post.content || "");
                  setEditing((v) => !v);
                }}
              >
                {editing ? "Cancel" : "Edit"}
              </button>
              <button className="btn ghost btnSmall danger" onClick={() => onDelete(post._id)}>
                Delete
              </button>
            </div>
          ) : null}
        </div>

        {editing ? (
          <div className="stack">
            <textarea className="textarea" rows={3} value={editText} onChange={(e) => setEditText(e.target.value)} />
            <div className="row">
              <button
                className="btn primary btnSmall"
                onClick={async () => {
                  const ok = await onEdit(post._id, editText);
                  if (ok) setEditing(false);
                }}
              >
                Save
              </button>
              <button className="btn ghost btnSmall" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="postContent">{renderContent(post.content)}</div>
        )}

        {post.imageUrl ? (
          <img className="postInlineImage" src={post.imageUrl} alt="Post attachment" />
        ) : null}

        <div className="postActions xPostActions">
          <button className={`pill ${likedByMe ? "on" : ""}`} onClick={() => onLike(post._id)}>
            Like · {post.likes?.length || 0}
          </button>
          <div className="pill muted">Replies · {post.comments?.length || 0}</div>
        </div>

        <div className="commentBox">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Post your reply"
          />
          <button
            className="btn btnSmall"
            onClick={() => {
              if (!text.trim()) return;
              onComment(post._id, text.trim());
              setText("");
            }}
          >
            Reply
          </button>
        </div>

        {post.comments?.length ? (
          <div className="comments">
            {post.comments.slice(-3).map((c) => (
              <div key={c._id} className="comment">
                <span className="commentAuthor">{c.userId?.name || "Student"}:</span> {c.text}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    const data = await apiFetch("/api/posts");
    setPosts(data.posts || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function createPost() {
    if (!content.trim()) return;
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/posts", {
        method: "POST",
        body: { content: content.trim(), imageUrl: findImageUrlFromText(content.trim()) },
      });
      setContent("");
      setToast("Post published");
      setTimeout(() => setToast(""), 1800);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function like(postId) {
    await apiFetch(`/api/posts/${postId}/like`, { method: "POST" });
    await load();
  }

  async function comment(postId, text) {
    await apiFetch(`/api/posts/${postId}/comments`, { method: "POST", body: { text } });
    await load();
  }

  async function remove(postId) {
    setError("");
    try {
      await apiFetch(`/api/posts/${postId}`, { method: "DELETE" });
      setToast("Post deleted");
      setTimeout(() => setToast(""), 1800);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function edit(postId, nextContent) {
    setError("");
    try {
      await apiFetch(`/api/posts/${postId}`, { method: "PUT", body: { content: nextContent.trim() } });
      setToast("Post updated");
      setTimeout(() => setToast(""), 1800);
      await load();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }

  return (
    <div className="page">
      {toast ? <div className="toast success">{toast}</div> : null}
      <div className="xFeedWrap">
        <div className="card xComposer">
          <div className="cardTitle">Home</div>
          <textarea
            className="textarea"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What is happening?"
          />
          <div className="hint">Paste links directly in post text. Image links are auto-previewed.</div>
          {error ? <div className="alert error">{error}</div> : null}
          <div className="row">
            <button className="btn primary" disabled={busy} onClick={createPost}>
              {busy ? "Posting..." : "Post"}
            </button>
            <button className="btn ghost" onClick={() => load().catch(() => {})}>
              Refresh
            </button>
          </div>
        </div>
        <div className="stack xTimeline">
          {posts.length ? (
            posts.map((p) => (
              <PostCard
                key={p._id}
                post={p}
                meId={user?.id}
                onLike={like}
                onComment={comment}
                onDelete={remove}
                onEdit={edit}
              />
            ))
          ) : (
            <div className="card">No posts yet. Be the first to post.</div>
          )}
        </div>
      </div>
    </div>
  );
}

