import React, { useEffect, useState } from "react";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(API + "/api/admin/reports/videos" + (status ? `?status=${status}` : ""), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reports");
      setReports(data.data || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [status]);

  const updateStatus = async (id, nextStatus) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(API + "/api/admin/reports/videos/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      fetchReports();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteVideo = async (videoId) => {
    if (!videoId || !window.confirm("Delete this reported video permanently?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(API + "/api/videos/" + videoId, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      fetchReports();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading reports...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reported Videos</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded p-2">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="reviewed">Reviewed</option>
          <option value="dismissed">Dismissed</option>
          <option value="actioned">Actioned</option>
        </select>
      </div>

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left">
              <th className="p-2">Video</th>
              <th className="p-2">Reporter</th>
              <th className="p-2">Reason</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id} className="border-t align-top">
                <td className="p-2">
                  <div className="flex gap-3">
                    {report.video?.thumbnail && <img src={report.video.thumbnail} className="w-24 h-14 object-cover rounded" />}
                    <div>
                      <div className="font-semibold">{report.video?.title || "Deleted video"}</div>
                      <div className="text-sm text-gray-500">{report.video?.owner?.channelName || report.video?.owner?.name || "-"}</div>
                    </div>
                  </div>
                </td>
                <td className="p-2">{report.reporter?.channelName || report.reporter?.name || "-"}</td>
                <td className="p-2 max-w-md">{report.reason}</td>
                <td className="p-2 capitalize">{report.status}</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-2">
                    {["reviewed", "dismissed", "actioned"].map((next) => (
                      <button key={next} onClick={() => updateStatus(report._id, next)} className="px-2 py-1 bg-blue-600 text-white rounded capitalize">
                        {next}
                      </button>
                    ))}
                    {report.video?.videoUrl && (
                      <a href={report.video.videoUrl} target="_blank" rel="noreferrer" className="px-2 py-1 bg-gray-700 text-white rounded">
                        Open
                      </a>
                    )}
                    {report.video?._id && (
                      <button onClick={() => deleteVideo(report.video._id)} className="px-2 py-1 bg-red-600 text-white rounded">
                        Delete Video
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan="5">No reports found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
