import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { usersService } from '../api/users';
import { formatRussianDate } from '../utils/formatters';
import Skeleton from '../components/UI/Skeleton';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileStats from '../components/Profile/ProfileStats';
import ProfileTabs from '../components/Profile/ProfileTabs';
import ProjectFilters from '../components/Profile/ProjectFilters';
import ProjectList from '../components/Profile/ProjectList';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import ImageCropper from '../components/Profile/ImageCropper';
import ProfileSettingsModal from '../components/Profile/ProfileSettingsModal';

const ProfilePage: React.FC = () => {
  // ... typical state ...
  const { username: paramUsername } = ReactRouterDOM.useParams();
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Мои проекты');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGame, setFilterGame] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [editingBio, setEditingBio] = useState(false);
  const [localBio, setLocalBio] = useState('');
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Increased for better feel

  // Кроппер
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropType, setCropType] = useState<'avatar' | 'banner'>('avatar');
  const [tempImageUrl, setTempImageUrl] = useState('');

  // Состояние кроп-бокса (в процентах от изображения)
  const [cropBox, setCropBox] = useState({ x: 25, y: 25, width: 40, height: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startBox, setStartBox] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cropperContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [profileData, setProfileData] = useState<any>(null);
  const [myMods, setMyMods] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine which username to fetch
        let usernameToFetch = paramUsername;
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');

        if (!usernameToFetch) {
          if (!localUser.username) {
            setError('User not found');
            setLoading(false);
            return;
          }
          usernameToFetch = localUser.username;
        }

        const profile = await usersService.getProfile(usernameToFetch!);
        setProfileData(profile);
        const isOwn = localUser.username === profile.username;
        setIsOwnProfile(isOwn);

        // Sync local storage and global state if it's our own profile
        if (isOwn) {
          const updatedUser = { ...localUser, ...profile };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // Note: we don't need to dispatch 'auth_state_changed' here necessarily 
          // because we are already on the profile page, but it helps Header etc.
          window.dispatchEvent(new Event('auth_state_changed'));
        }

        const items = await usersService.getUserItems(usernameToFetch!);
        setMyMods(items.map((i: any) => ({
          ...i,
          img: i.cover_url || `https://picsum.photos/seed/${i.id}/300/200`,
          downloads: i.stats?.downloads || 0,
          likes: i.stats?.likes || 0,
          date: formatRussianDate(i.created_at)
        })));

      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [paramUsername]);

  useEffect(() => {
    if (profileData?.bio) {
      setLocalBio(profileData.bio);
    }
  }, [profileData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [paramUsername]);

  const handleApplySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await usersService.updateProfile({
        display_name: profileData.display_name,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        banner_url: profileData.banner_url,
        links: profileData.links
      });
      setProfileData(updated);

      // If display name or other profile data was updated, we stay.
      // But if there's a separate mechanism for username (PATCH), we need to handle it.

      setIsSettingsOpen(false);
      alert('Профиль обновлен!');
    } catch (err) {
      console.error(err);
      alert('Ошибка при обновлении профиля');
    }
  };

  const handleSaveBio = async () => {
    try {
      const updated = await usersService.updateProfile({ bio: localBio });
      setProfileData(updated);
      setEditingBio(false);
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении');
    }
  };

  const isValidUrl = (s: string) => {
    try {
      const u = new URL(s);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch { return false; }
  };

  const handleSaveLinks = async (links: { label: string; url: string }[]) => {
    if (links.some(l => !isValidUrl(l.url))) {
      alert('Все ссылки должны быть валидными URL (http/https).');
      return;
    }
    try {
      const updated = await usersService.updateProfile({ links });
      setProfileData(updated);
      setNewLinkUrl('');
      setNewLinkLabel('');
      setShowAddLinkForm(false);
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении ссылок');
    }
  };

  const handleAddLink = () => {
    const current = profileData?.links || [];
    if (current.length >= 5) return;
    if (!newLinkUrl.trim()) return;
    if (!isValidUrl(newLinkUrl.trim())) {
      alert('Введите корректный URL (например https://...).');
      return;
    }
    const label = newLinkLabel.trim() || (() => { try { return new URL(newLinkUrl.trim()).hostname; } catch { return 'Ссылка'; } })();
    handleSaveLinks([...current, { label, url: newLinkUrl.trim() }]);
  };

  const handleRemoveLink = async (index: number) => {
    const next = (profileData?.links || []).filter((_: any, i: number) => i !== index);
    await handleSaveLinks(next);
  };

  const uniqueGames = useMemo(() => [...new Set(myMods.map((i: any) => i.game_slug).filter(Boolean))], [myMods]);
  const uniqueCategories = useMemo(() => {
    const list = !filterGame ? myMods : myMods.filter((i: any) => i.game_slug === filterGame);
    return [...new Set(list.map((i: any) => i.section_slug).filter(Boolean))];
  }, [myMods, filterGame]);

  const filteredList = useMemo(() => {
    const list = activeTab === 'Мои проекты' ? myMods : [];
    return list.filter((item: any) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGame = !filterGame || item.game_slug === filterGame;
      const matchesCategory = !filterCategory || item.section_slug === filterCategory;
      return matchesSearch && matchesGame && matchesCategory;
    });
  }, [activeTab, searchQuery, filterGame, filterCategory, myMods]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImageUrl(url);
      setCropType(type);
      setIsCropOpen(true);
    }
    e.target.value = '';
  };

  const onImageLoad = () => {
    if (!imageRef.current) return;
    const { width, height } = imageRef.current;
    const targetRatio = cropType === 'avatar' ? 1.0 : (760 / 280);
    const imgRatio = width / height;

    let cropW, cropH;
    if (imgRatio > targetRatio) {
      cropH = 60;
      cropW = (cropH / imgRatio) * targetRatio;
    } else {
      cropW = 60;
      cropH = (cropW * imgRatio) / targetRatio;
    }

    setCropBox({
      x: (100 - cropW) / 2,
      y: (100 - cropH) / 2,
      width: cropW,
      height: cropH
    });
  };

  const saveCroppedImage = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const cropX = (cropBox.x / 100) * img.width * scaleX;
    const cropY = (cropBox.y / 100) * img.height * scaleY;
    const cropWidth = (cropBox.width / 100) * img.width * scaleX;
    const cropHeight = (cropBox.height / 100) * img.height * scaleY;

    canvas.width = cropType === 'avatar' ? 200 : 760;
    canvas.height = cropType === 'avatar' ? 200 : 280;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const { url } = await usersService.uploadImage(cropType, blob, `${cropType}.jpg`);
        setProfileData((prev: any) => ({
          ...prev,
          [cropType === 'avatar' ? 'avatar_url' : 'banner_url']: url
        }));
      } catch (err) {
        console.error('Failed to upload image:', err);
        alert('Ошибка при загрузке изображения');
      } finally {
        setIsCropOpen(false);
      }
    }, 'image/jpeg', 0.98);
  };

  const handleMouseDown = (e: React.MouseEvent, type: typeof dragType) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartBox({ ...cropBox });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !imageRef.current) return;

    const container = imageRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startPos.x) / container.width) * 100;
    const dy = ((e.clientY - startPos.y) / container.height) * 100;

    setCropBox(prev => {
      let next = { ...prev };
      const imgRatio = container.width / container.height;
      const targetRatio = cropType === 'avatar' ? 1.0 : (760 / 280);
      const k = imgRatio / targetRatio;

      if (dragType === 'move') {
        next.x = Math.max(0, Math.min(100 - prev.width, startBox.x + dx));
        next.y = Math.max(0, Math.min(100 - prev.height, startBox.y + dy));
      } else if (dragType) {
        let deltaW = (dragType === 'se' || dragType === 'ne') ? dx : -dx;
        let newW = Math.max(10, startBox.width + deltaW);

        if (dragType === 'se' || dragType === 'ne') {
          newW = Math.min(newW, 100 - startBox.x);
        } else {
          newW = Math.min(newW, startBox.x + startBox.width);
        }

        let newH = newW * k;

        if (dragType === 'se' || dragType === 'sw') {
          if (startBox.y + newH > 100) {
            newH = 100 - startBox.y;
            newW = newH / k;
          }
        } else {
          if (startBox.y + startBox.height - newH < 0) {
            newH = startBox.y + startBox.height;
            newW = newH / k;
          }
        }

        next.width = newW;
        next.height = newH;

        if (dragType === 'nw') {
          next.x = startBox.x + (startBox.width - newW);
          next.y = startBox.y + (startBox.height - newH);
        } else if (dragType === 'ne') {
          next.y = startBox.y + (startBox.height - newH);
        } else if (dragType === 'sw') {
          next.x = startBox.x + (startBox.width - newW);
        }
      }
      return next;
    });
  }, [isDragging, dragType, startPos, startBox, cropType]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-[#1c1c1f] flex flex-col items-center justify-center gap-6">
        <h2 className="text-3xl font-black uppercase text-zinc-700">{error || 'Профиль не найден'}</h2>
        <ReactRouterDOM.Link to="/" className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] no-underline">На главную</ReactRouterDOM.Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1c1f] text-white font-['Inter',_sans-serif] pb-20 relative">
      <div className="max-w-[1300px] mx-auto px-6 pt-10">
        <ProfileHeader
          profileData={profileData}
          loading={loading}
          isOwnProfile={isOwnProfile}
          myModsCount={myMods.length}
          bannerInputRef={bannerInputRef}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          editingBio={editingBio}
          localBio={localBio}
          setLocalBio={setLocalBio}
          handleSaveBio={handleSaveBio}
          setEditingBio={setEditingBio}
        />

        <div className="bg-[#24262b] rounded-2xl overflow-hidden shadow-2xl mb-12 relative px-12 pb-12 pt-4">
          <ProfileStats
            profileData={{
              ...profileData,
              total_downloads: myMods.reduce((acc, mod) => acc + (mod.downloads || 0), 0),
              total_likes: myMods.reduce((acc, mod) => acc + (mod.likes || 0), 0)
            }}
            loading={loading}
            myModsCount={myMods.length}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <ProfileTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isOwnProfile={isOwnProfile}
              setCurrentPage={setCurrentPage}
            />
            <ProjectFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterGame={filterGame}
              setFilterGame={setFilterGame}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              uniqueGames={uniqueGames}
              uniqueCategories={uniqueCategories}
              activeTab={activeTab}
              myModsLength={myMods.length}
              setCurrentPage={setCurrentPage}
            />
            <ProjectList
              loading={loading}
              myMods={myMods}
              paginatedList={paginatedList}
              profileData={profileData}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
          <ProfileSidebar
            profileData={profileData}
            isOwnProfile={isOwnProfile}
            onRemoveLink={handleRemoveLink}
            onAddLink={handleAddLink}
            showAddLinkForm={showAddLinkForm}
            setShowAddLinkForm={setShowAddLinkForm}
            newLinkUrl={newLinkUrl}
            setNewLinkUrl={setNewLinkUrl}
            newLinkLabel={newLinkLabel}
            setNewLinkLabel={setNewLinkLabel}
          />
        </div>
      </div>

      <ImageCropper
        isCropOpen={isCropOpen}
        setIsCropOpen={setIsCropOpen}
        cropType={cropType}
        tempImageUrl={tempImageUrl}
        cropBox={cropBox}
        handleMouseDown={handleMouseDown}
        imageRef={imageRef}
        cropperContainerRef={cropperContainerRef}
        onImageLoad={onImageLoad}
        saveCroppedImage={saveCroppedImage}
      />

      <ProfileSettingsModal
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        profileData={profileData}
        setProfileData={setProfileData}
        handleApplySettings={handleApplySettings}
      />
    </div>
  );
};

export default ProfilePage;
