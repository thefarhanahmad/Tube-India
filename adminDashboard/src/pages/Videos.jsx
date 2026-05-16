import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editVideo, setEditVideo] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteVideo, setDeleteVideo] = useState(null);

  const [categories, setCategories] = useState([]);

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API + "/api/videos", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setVideos(data.data || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(API + "/api/categories", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setCategories(data.data || []);
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, []);

  const handleUpload = async (formData) => {
    try {
      const res = await fetch(API + "/api/videos/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setShowAdd(false);
      fetchVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      const res = await fetch(API + "/api/videos/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setShowEdit(false);
      setEditVideo(null);
      fetchVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(API + "/api/videos/" + id, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setShowDelete(false);
      setDeleteVideo(null);
      fetchVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading videos...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Videos</h2>
        <button onClick={() => setShowAdd(true)} className="px-3 py-1 bg-blue-600 text-white rounded">Upload Video</button>
      </div>

      <div className="bg-white rounded shadow p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left">
              <th className="p-2">Thumbnail</th>
              <th className="p-2">Title</th>
              <th className="p-2">Owner</th>
              <th className="p-2">Category</th>
              <th className="p-2">Views</th>
              <th className="p-2">Visibility</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v._id} className="border-t">
                <td className="p-2 align-middle">
                  <img src={v.thumbnail} alt="thumb" className="w-24 h-14 object-cover rounded" />
                </td>
                <td className="p-2 align-middle">
                  <div className="font-semibold">{v.title}</div>
                  <div className="text-sm text-gray-500">{v.description ? v.description.slice(0, 80) + (v.description.length>80? '...':'') : ''}</div>
                </td>
                <td className="p-2 align-middle">{v.owner?.name || 'Unknown'}</td>
                <td className="p-2 align-middle">{v.category?.name || v.category || '-'}</td>
                <td className="p-2 align-middle">{v.views || 0}</td>
                <td className="p-2 align-middle">{v.visibility || 'public'}</td>
                <td className="p-2 align-middle">
                  <button onClick={() => { setEditVideo(v); setShowEdit(true); }} className="px-2 py-1 bg-yellow-400 rounded mr-2">Edit</button>
                  <button onClick={() => { setDeleteVideo(v); setShowDelete(true); }} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Upload Video" onClose={() => setShowAdd(false)}>
          <UploadForm categories={categories} onSubmit={handleUpload} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {showEdit && editVideo && (
        <Modal title="Edit Video" onClose={() => { setShowEdit(false); setEditVideo(null); }}>
          <EditForm initial={editVideo} categories={categories} onSubmit={(payload) => handleUpdate(editVideo._id, payload)} onCancel={() => { setShowEdit(false); setEditVideo(null); }} />
        </Modal>
      )}

      {showDelete && deleteVideo && (
        <ConfirmModal title="Confirm delete" message={`Delete video ${deleteVideo.title}?`} onConfirm={() => handleDelete(deleteVideo._id)} onCancel={() => { setShowDelete(false); setDeleteVideo(null); }} />
      )}
    </div>
  );
};

const UploadForm = ({ categories = [], onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!videoFile || !thumbnailFile)
      return alert("Please select video and thumbnail");
    const fd = new FormData();
    fd.append("video", videoFile);
    fd.append("thumbnail", thumbnailFile);
    fd.append("title", title);
    fd.append("description", description);
    fd.append("category", category);
    fd.append("visibility", visibility);
    onSubmit(fd);
  };

  return (
    <form onSubmit={submit}>
      <label className="block mb-2">Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <label className="block mb-2">Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <label className="block mb-2">Category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      >
        <option value="">Select</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <label className="block mb-2">Video File</label>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files[0])}
        className="w-full mb-3"
      />

      <label className="block mb-2">Thumbnail</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setThumbnailFile(e.target.files[0])}
        className="w-full mb-3"
      />

      <label className="block mb-2">Visibility</label>
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
        <option value="private">Private</option>
      </select>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Upload
        </button>
      </div>
    </form>
  );
};

const EditForm = ({ initial = {}, categories = [], onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [category, setCategory] = useState(initial.category || "");
  const [visibility, setVisibility] = useState(initial.visibility || "public");

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, category, visibility });
  };

  return (
    <form onSubmit={submit}>
      <label className="block mb-2">Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <label className="block mb-2">Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <label className="block mb-2">Category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      >
        <option value="">Select</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <label className="block mb-2">Visibility</label>
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
        <option value="private">Private</option>
      </select>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default Videos;
