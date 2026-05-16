import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const Categories = () => {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteCat, setDeleteCat] = useState(null);

  const fetchCats = async ()=>{
    setLoading(true);
    setError(null);
    try{
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/categories', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setCats(data.data || []);
    }catch(err){ setError(err.message); }
    setLoading(false);
  };

  useEffect(()=>{ fetchCats(); },[]);

  const handleCreate = async (payload) => {
    try{
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Create failed');
      setShowAdd(false); fetchCats();
    }catch(err){ alert(err.message); }
  };

  const handleUpdate = async (id, payload) => {
    try{
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/categories/' + id, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setShowEdit(false); setEditCat(null); fetchCats();
    }catch(err){ alert(err.message); }
  };

  const handleDelete = async (id) => {
    try{
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/categories/' + id, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setShowDelete(false); setDeleteCat(null); fetchCats();
    }catch(err){ alert(err.message); }
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <button onClick={()=>setShowAdd(true)} className="px-3 py-1 bg-blue-600 text-white rounded">Add Category</button>
      </div>

      <div className="bg-white rounded shadow p-4">
        <ul>
          {cats.map(c=> (
            <li key={c._id} className="p-2 border-b flex justify-between items-center">
              <span>{c.name}</span>
              <span>
                <button onClick={()=>{ setEditCat(c); setShowEdit(true); }} className="px-2 py-1 bg-yellow-400 rounded mr-2">Edit</button>
                <button onClick={()=>{ setDeleteCat(c); setShowDelete(true); }} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {showAdd && (
        <Modal title="Add Category" onClose={()=>setShowAdd(false)}>
          <CategoryForm onSubmit={handleCreate} onCancel={()=>setShowAdd(false)} />
        </Modal>
      )}

      {showEdit && editCat && (
        <Modal title="Edit Category" onClose={()=>{ setShowEdit(false); setEditCat(null); }}>
          <CategoryForm initial={editCat} onSubmit={(payload)=>handleUpdate(editCat._id, payload)} onCancel={()=>{ setShowEdit(false); setEditCat(null); }} />
        </Modal>
      )}

      {showDelete && deleteCat && (
        <ConfirmModal title="Confirm delete" message={`Delete category ${deleteCat.name}?`} onConfirm={()=>handleDelete(deleteCat._id)} onCancel={()=>{ setShowDelete(false); setDeleteCat(null); }} />
      )}
    </div>
  );
};

const CategoryForm = ({ initial = {}, onSubmit, onCancel }) => {
  const [name, setName] = useState(initial.name || '');
  const submit = (e) => { e.preventDefault(); onSubmit({ name }); };
  return (
    <form onSubmit={submit}>
      <label className="block mb-2">Name</label>
      <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded mb-4" />
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
      </div>
    </form>
  );
};

export default Categories;