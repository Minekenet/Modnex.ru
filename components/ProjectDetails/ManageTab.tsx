import React, { useState, useMemo } from 'react';

interface FileSchemaField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface ManageTabProps {
  modData: any;
  gameSlug?: string;
  sectionSlug?: string;
  projectSlug?: string;
  fileSchema?: FileSchemaField[];
  onUpdateProject?: (data: { title?: string; summary?: string; description?: string; attributes?: Record<string, any>; status?: string }) => Promise<void>;
  onUploadVersion?: (file: File, version: string, extraData?: Record<string, string>) => Promise<void>;
  onReload?: () => void;
}

export const ManageTab: React.FC<ManageTabProps> = ({
  modData,
  gameSlug,
  sectionSlug,
  projectSlug,
  fileSchema = [],
  onUpdateProject,
  onUploadVersion,
  onReload
}) => {
  const [editTitle, setEditTitle] = useState(modData.title ?? '');
  const [editSummary, setEditSummary] = useState(modData.summary ?? modData.description?.slice(0, 200) ?? '');
  const [editDescription, setEditDescription] = useState(modData.description ?? '');
  const [editStatus, setEditStatus] = useState(modData.status ?? 'draft');
  const [editAttributes, setEditAttributes] = useState<Record<string, any>>(modData.attributes ?? {});
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadVersion, setUploadVersion] = useState('');
  const [fileAttrs, setFileAttrs] = useState<Record<string, string>>({});
  const [uploadLoading, setUploadLoading] = useState(false);

  const canUpdate = Boolean(gameSlug && sectionSlug && projectSlug && onUpdateProject);
  const canUpload = Boolean(modData?.id && onUploadVersion);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate || !onUpdateProject) return;
    try {
      setSaveLoading(true);
      await onUpdateProject({
        title: editTitle,
        summary: editSummary,
        description: editDescription,
        status: editStatus,
        attributes: Object.keys(editAttributes).length ? editAttributes : undefined
      });
      onReload?.();
    } catch (err) {
      console.error(err);
      alert('Не удалось сохранить изменения.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpload || !uploadFile || !uploadVersion.trim() || !onUploadVersion) return;
    try {
      setUploadLoading(true);
      const extra: Record<string, string> = { ...fileAttrs };
      await onUploadVersion(uploadFile, uploadVersion.trim(), Object.keys(extra).length ? extra : undefined);
      setUploadFile(null);
      setUploadVersion('');
      setFileAttrs({});
      onReload?.();
    } catch (err) {
      console.error(err);
      alert('Не удалось загрузить файл.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="bg-[#24262b] p-10 md:p-14 rounded-3xl space-y-12 shadow-xl">
      <section>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Редактировать проект</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-white/80 uppercase tracking-widest mb-2">Название</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-[#1a1b23] border border-white/10 p-4 rounded-xl text-white font-medium outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-white/80 uppercase tracking-widest mb-2">Краткое описание</label>
            <input
              type="text"
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="w-full bg-[#1a1b23] border border-white/10 p-4 rounded-xl text-white font-medium outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-white/80 uppercase tracking-widest mb-2">Описание</label>
            <textarea
              rows={6}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-[#1a1b23] border border-white/10 p-4 rounded-xl text-white font-medium outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-white/80 uppercase tracking-widest mb-2">Статус</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full bg-[#1a1b23] border border-white/10 p-4 rounded-xl text-white font-bold outline-none cursor-pointer"
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликован</option>
              <option value="hidden">Скрыт</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saveLoading || !canUpdate}
            className="px-8 py-3.5 bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] rounded-xl border-none cursor-pointer hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {saveLoading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </section>

      <section className="pt-8 border-t border-white/10">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Добавить новую версию</h2>
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-white/80 uppercase tracking-widest mb-2">Версия</label>
            <input
              type="text"
              value={uploadVersion}
              onChange={(e) => setUploadVersion(e.target.value)}
              placeholder="например 1.0.0"
              className="w-full bg-[#1a1b23] border border-white/10 p-4 rounded-xl text-white font-medium outline-none"
            />
          </div>
          {fileSchema.map((field) => (
            field.key === 'version_number' ? null : (
              <div key={field.key}>
                <label className="block text-[10px] font-black text-white/80 uppercase tracking-widest mb-2">{field.label}</label>
                {field.type === 'select' && field.options ? (
                  <select
                    value={fileAttrs[field.key] ?? ''}
                    onChange={(e) => setFileAttrs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-[#1a1b23] border border-white/10 p-4 rounded-xl text-white font-bold outline-none cursor-pointer"
                  >
                    <option value="">Выберите...</option>
                    {field.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={fileAttrs[field.key] ?? ''}
                    onChange={(e) => setFileAttrs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-[#1a1b23] border border-white/10 p-4 rounded-xl text-white font-medium outline-none"
                  />
                )}
              </div>
            )
          ))}
          <div>
            <label className="block text-[10px] font-black text-white/80 uppercase tracking-widest mb-2">Файл</label>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              className="w-full bg-[#1a1b23] border border-white/10 p-4 rounded-xl text-white/80 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-bold file:cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={uploadLoading || !uploadFile || !uploadVersion.trim() || !canUpload}
            className="px-8 py-3.5 bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] rounded-xl border-none cursor-pointer hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {uploadLoading ? 'Загрузка...' : 'Загрузить версию'}
          </button>
        </form>
      </section>
    </div>
  );
};
