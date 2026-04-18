import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { CURRENT_USER_STORAGE_KEY } from '../../utils/authSession';

type User = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
};

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  let authPayload: any = null;
  try {
    const rawCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (rawCurrentUser) {
      authPayload = JSON.parse(rawCurrentUser);
    }
  } catch (e) {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }

  useEffect(() => {
    if (authPayload?.email) {
      userService.getMyProfile(authPayload.email)
        .then(data => {
          setUserProfile(data);
          setProfileForm({
            fullName: data.fullName || '',
            phone: data.phone || '',
          });
        })
        .catch(err => {
          console.error('Lỗi khi tải thông tin:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [authPayload?.email]);

  if (!authPayload) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <span className="ml-3 text-on-surface">Đang tải hồ sơ...</span>
      </div>
    );
  }

  const displayUser = userProfile || authPayload;

  const handleSaveProfile = async () => {
    if (!authPayload?.email) return;
    setProfileErr('');
    setProfileMsg('');
    setIsSavingProfile(true);
    try {
      const updated = await userService.updateMyProfile(authPayload.email, {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
      });
      setUserProfile(updated);
      setProfileForm({
        fullName: updated.fullName || '',
        phone: updated.phone || '',
      });
      const rawCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (rawCurrentUser) {
        try {
          const parsed = JSON.parse(rawCurrentUser);
          localStorage.setItem(
            CURRENT_USER_STORAGE_KEY,
            JSON.stringify({
              ...parsed,
              fullName: updated.fullName,
              phone: updated.phone,
            })
          );
        } catch {}
      }
      setProfileMsg('Đã cập nhật thông tin cá nhân.');
    } catch (err: any) {
      setProfileErr(err.response?.data || 'Cập nhật thông tin thất bại.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-headline font-bold text-on-surface mb-8">Hồ sơ cá nhân</h1>
      <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/20 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 flex justify-center">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-surface-container-high">
            <img
              src={displayUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-5">
          <h2 className="text-xl font-headline font-bold text-on-surface">Cập nhật thông tin</h2>
          <div>
            <p className="text-sm text-on-surface-variant mb-1">Họ tên</p>
            <input
              value={profileForm.fullName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
              className="w-full border border-outline-variant/40 rounded-lg px-3 py-2 bg-surface"
            />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant mb-1">Email (không đổi)</p>
            <input
              value={displayUser.email || ''}
              readOnly
              className="w-full border border-outline-variant/30 rounded-lg px-3 py-2 bg-surface-container-low text-on-surface-variant"
            />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant mb-1">SĐT</p>
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full border border-outline-variant/40 rounded-lg px-3 py-2 bg-surface"
            />
          </div>
          {profileErr ? <p className="text-sm text-red-600">{profileErr}</p> : null}
          {profileMsg ? <p className="text-sm text-green-600">{profileMsg}</p> : null}
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-headline font-bold hover:opacity-90 disabled:opacity-50"
          >
            {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}
