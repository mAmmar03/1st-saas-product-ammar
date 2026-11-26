import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MapPin,
  Phone,
  FileText,
  Trash2,
  Edit,
  Scissors,
  Camera,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { useRole } from '../context/RoleContext';
import AddInfluencerModal from '../components/AddInfluencerModal';

export default function InfluencersDirectory({ onOpenNewInfluencer, onOpenDossier }) {
  const { showAlert, showConfirm } = useAlert();
  const { hasPermission } = useRole();
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [editingInfluencer, setEditingInfluencer] = useState(null);

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = async () => {
    setLoading(true);
    try {
      const res = await api.getInfluencers();
      setInfluencers(res.data);
    } catch (err) {
      console.error('Error fetching influencers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Direct Photo Upload for any existing influencer
  const handlePhotoUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Photo must be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        setUpdatingId(id);
        await api.updateInfluencer(id, { profileImage: base64 });
        showAlert('Creator photo updated successfully!', 'success');
        setInfluencers((prev) =>
          prev.map((inf) => (inf._id === id ? { ...inf, profileImage: base64 } : inf))
        );
      } catch (err) {
        showAlert('Failed to update creator photo: ' + (err.response?.data?.error || err.message), 'error');
      } finally {
        setUpdatingId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id, name) => {
    showConfirm({
      title: 'Delete Creator Profile?',
      message: `Are you sure you want to delete profile for ${name}? This action cannot be undone.`,
      confirmText: 'Yes, Delete Profile',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await api.deleteInfluencer(id);
          showAlert(`Profile for ${name} deleted successfully!`, 'success');
          loadInfluencers();
        } catch (err) {
          showAlert('Failed to delete influencer profile', 'error');
        }
      },
    });
  };

  const filtered = influencers.filter(
    (inf) =>
      inf.name?.toLowerCase().includes(search.toLowerCase()) ||
      inf.instagramHandle?.toLowerCase().includes(search.toLowerCase()) ||
      inf.city?.toLowerCase().includes(search.toLowerCase()) ||
      inf.niche?.toLowerCase().includes(search.toLowerCase()) ||
      inf.primaryPlatform?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            Influencer Bio-Data Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage creator profiles, lifetime deals, garment sizes & verified courier addresses
          </p>
        </div>

        <button
          onClick={onOpenNewInfluencer}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shrink-0 shadow-subtle active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Influencer Profile
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by creator name, @handle, city, or dress size..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading creator profiles...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200/80 text-center space-y-3 shadow-subtle">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-sm">No Influencers Registered</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Add Influencer Profile" to add creator details and PR shipping addresses.
          </p>
          <button
            onClick={onOpenNewInfluencer}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition active:scale-[0.98]"
          >
            Add New Influencer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inf) => (
            <div
              key={inf._id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Creator Avatar with Photo Upload */}
                    <div className="relative group w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {inf.profileImage ? (
                        <img
                          src={inf.profileImage}
                          alt={inf.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-slate-300" />
                      )}

                      {/* Photo Upload Overlay Button */}
                      <label
                        title="Upload creator photo"
                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-[8px] font-semibold"
                      >
                        <Camera className="w-3.5 h-3.5 mb-0.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(inf._id, e)}
                          className="hidden"
                          disabled={updatingId === inf._id}
                        />
                      </label>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 truncate">
                        {inf.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-medium rounded px-1.5 py-0.5 bg-slate-100 text-slate-600">
                          {inf.primaryPlatform || 'Instagram'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium truncate">
                          {inf.instagramHandle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1 shrink-0">
                    <Scissors className="w-3 h-3 text-slate-400" />
                    {inf.preferredSize || 'Medium'}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-600">
                    {(inf.followers || 0).toLocaleString()} Followers
                  </span>
                  {inf.city && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {inf.city}
                    </span>
                  )}
                  {inf.niche && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-600">
                      {inf.niche}
                    </span>
                  )}
                </div>

                {/* Contact & Address */}
                <div className="space-y-1 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  {inf.phone && (
                    <p className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" /> {inf.phone}
                    </p>
                  )}
                  {inf.shippingAddress && (
                    <p className="line-clamp-2 text-[11px] text-slate-500 mt-1">
                      <strong className="text-slate-700">PR Address:</strong> {inf.shippingAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenDossier(inf._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition active:scale-[0.98] shadow-subtle"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Collab Dossier
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingInfluencer(inf)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                    title="Edit creator profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {hasPermission('canDeleteInfluencers') && (
                    <button
                      onClick={() => handleDelete(inf._id, inf.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition"
                      title="Delete profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingInfluencer && (
        <AddInfluencerModal
          isOpen={Boolean(editingInfluencer)}
          influencerToEdit={editingInfluencer}
          onClose={() => setEditingInfluencer(null)}
          onSuccess={() => {
            setEditingInfluencer(null);
            loadInfluencers();
          }}
        />
      )}
    </div>
  );
}
