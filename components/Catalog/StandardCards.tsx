
import React from 'react';
import {
    IconCalendar,
    IconDownload,
    IconMoreHoriz,
    IconSchedule,
    IconThumbUp,
    IconVisibility,
    IconDescription
} from '../UI/MaterialIcons';

interface FilterOptionPreview {
    label: string;
    options?: string[];
    is_preview?: boolean;
    preview_limit?: number;
}

interface CardProps {
    mod: any;
    gameSlug: string;
    badgeFields?: string[];
    badgeMax?: number;
    previewFilterConfig?: FilterOptionPreview[];
    onClick: () => void;
}

/** Build badges from attributes using only filters with is_preview and preview_limit; returns badges + remaining count for "+ N more" */
export const getPreviewBadges = (mod: any, previewFilterConfig?: FilterOptionPreview[]): { badges: string[]; moreCount: number } => {
    const attrs = mod?.attributes || {};
    const result: string[] = [];
    let totalOmitted = 0;

    const attrKey = (label: string) => label.toLowerCase().replace(/\s+/g, '_');

    if (previewFilterConfig && previewFilterConfig.length > 0) {
        for (const filter of previewFilterConfig) {
            if (!filter.is_preview || (filter.preview_limit ?? 0) <= 0) continue;
            const key = attrKey(filter.label);
            const value = attrs[key];
            const limit = filter.preview_limit ?? 1;
            const values = Array.isArray(value) ? value : value !== undefined && value !== null ? [String(value)] : [];
            const shown = values.slice(0, limit).map((v: any) => String(v).trim()).filter(Boolean);
            const omitted = values.length - shown.length;
            if (omitted > 0) totalOmitted += omitted;
            for (const v of shown) {
                if (v && !result.includes(v)) result.push(v);
            }
        }
        return { badges: result, moreCount: totalOmitted };
    }
    return { badges: [], moreCount: 0 };
};

const normalizeBadges = (mod: any, badgeFields?: string[], maxBadges: number = 6, previewFilterConfig?: FilterOptionPreview[]): string[] => {
    if (previewFilterConfig && previewFilterConfig.some(f => f.is_preview)) {
        const { badges } = getPreviewBadges(mod, previewFilterConfig);
        return badges.slice(0, maxBadges);
    }
    const attrs = mod?.attributes || {};
    const rawTags = attrs.tags || mod.tags;
    const tagsArray = Array.isArray(rawTags)
        ? rawTags
        : typeof rawTags === 'string'
            ? rawTags.split(',').map((t: string) => t.trim())
            : [];

    const result: string[] = [];
    const push = (val: any) => {
        if (val === undefined || val === null) return;
        const s = String(val).trim();
        if (!s) return;
        if (!result.includes(s)) result.push(s);
    };

    const fields = badgeFields && badgeFields.length > 0
        ? badgeFields
        : ['loader', 'environment', 'game_versions', 'category', 'mod_version', 'tags'];

    for (const field of fields) {
        if (result.length >= maxBadges) break;

        if (field === 'tags') {
            for (const t of tagsArray) {
                if (result.length >= maxBadges) break;
                push(t);
            }
            continue;
        }

        const value = attrs[field];
        if (Array.isArray(value)) {
            for (const v of value) {
                if (result.length >= maxBadges) break;
                push(v);
            }
        } else if (value !== undefined) {
            push(value);
        }
    }

    return result.slice(0, maxBadges);
};

const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const formatShortDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const extractCardMeta = (mod: any) => {
    const stats = mod.stats || {};
    const downloads = stats.downloads ?? mod.downloads ?? 0;
    const likes = stats.likes ?? 0;
    const views = stats.views ?? 0;
    const createdAt = mod.created_at || mod.createdAt;
    const relativeTime = formatRelativeTime(createdAt);
    const fullDate = formatShortDate(createdAt);
    const category =
        mod.category ||
        mod.section_slug ||
        mod.attributes?.category ||
        mod.attributes?.type ||
        mod.attributes?.tag ||
        '';
    const image =
        mod.cover_url ||
        mod.banner_url ||
        (mod.gallery && mod.gallery.length > 0 ? mod.gallery[0] : null) ||
        `https://picsum.photos/seed/${mod.id || mod.slug}/600/350`;
    const description = mod.summary || mod.description || mod.desc || '';
    const fileSize = mod.attributes?.fileSize || mod.attributes?.size || '';

    return {
        stats,
        downloads,
        likes,
        views,
        createdAt,
        relativeTime,
        fullDate,
        category,
        image,
        description,
        fileSize
    };
};

export const GridCard: React.FC<CardProps> = ({ mod, gameSlug, badgeFields, badgeMax, previewFilterConfig, onClick }) => {
    const { image, category, description, downloads, likes, views, relativeTime, fullDate, fileSize } = extractCardMeta(mod);
    const usePreview = previewFilterConfig?.some(f => f.is_preview);
    const previewResult = usePreview ? getPreviewBadges(mod, previewFilterConfig) : null;
    const badges = usePreview && previewResult ? previewResult.badges : normalizeBadges(mod, badgeFields, badgeMax ?? 6, previewFilterConfig);
    const moreCount = previewResult?.moreCount ?? 0;

    return (
        <div
            className="bg-[#202226] rounded-xl overflow-hidden flex flex-col group cursor-pointer transition-all hover:-translate-y-0.5"
            onClick={onClick}
        >
            <div className="aspect-[16/9] relative overflow-hidden bg-[#101114]">
                <img
                    src={image}
                    className="w-full h-full object-cover"
                    alt={mod.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
            </div>

            <div className="flex-1 flex flex-col">
                <div className="px-4 pt-4 pb-3 space-y-2">
                    <h3 className="font-semibold text-[15px] text-white leading-snug line-clamp-2">
                        {mod.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span className="font-medium">by {mod.author_name || 'Unknown'}</span>
                        {category && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                <span className="px-2 py-0.5 bg-zinc-800/80 text-[10px] rounded-full font-semibold text-zinc-200">
                                    {category}
                                </span>
                            </>
                        )}
                    </div>
                    {(badges.length > 0 || moreCount > 0) && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                            {badges.map((b) => (
                                <span
                                    key={b}
                                    className="px-2 py-0.5 bg-white/5 text-[10px] rounded-full font-semibold text-zinc-200 max-w-full truncate"
                                    title={b}
                                >
                                    {b}
                                </span>
                            ))}
                            {moreCount > 0 && (
                                <span className="px-2 py-0.5 bg-white/10 text-[10px] rounded-full font-semibold text-zinc-400">
                                    + ещё {moreCount}
                                </span>
                            )}
                        </div>
                    )}
                    {description && (
                        <p className="text-[12px] text-zinc-400 leading-snug line-clamp-2">
                            {description}
                        </p>
                    )}
                    {(relativeTime || fullDate) && (
                        <div className="mt-1 flex items-center gap-4 text-[11px] text-zinc-500">
                            {relativeTime && (
                                <span className="inline-flex items-center gap-1">
                                    <IconSchedule className="w-4 h-4 text-zinc-500" />
                                    {relativeTime}
                                </span>
                            )}
                            {fullDate && (
                                <span className="inline-flex items-center gap-1">
                                    <IconCalendar className="w-4 h-4 text-zinc-500" />
                                    {fullDate}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-auto px-4 py-2.5 bg-[#18191d] flex items-center justify-between text-[11px] text-zinc-400">
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5">
                            <IconThumbUp className="w-4 h-4 text-zinc-300" />
                            {(likes || 0).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <IconDownload className="w-4 h-4 text-zinc-300" />
                            {(downloads || 0).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <IconVisibility className="w-4 h-4 text-zinc-300" />
                            {(views || 0).toLocaleString()}
                        </span>
                    </div>
                    {fileSize && (
                        <span className="inline-flex items-center gap-1.5 text-zinc-300">
                            <IconDescription className="w-4 h-4 text-zinc-300" />
                            {fileSize}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

/** Минималистичная компактная карточка: только обложка, название/краткое описание, ровно 1 тег (Категория). */
export const CompactCard: React.FC<CardProps> = ({ mod, gameSlug, onClick }) => {
    const { image, category, description, likes, downloads } = extractCardMeta(mod);

    return (
        <div
            className="bg-[#24262b] rounded-2xl overflow-hidden flex flex-col p-0 group cursor-pointer transition-all"
            onClick={onClick}
        >
            <div className="aspect-video w-full overflow-hidden bg-[#101114] relative">
                <img
                    src={image}
                    className="w-full h-full object-cover transition-transform duration-500"
                    alt={mod.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <div className="flex items-center gap-3 text-[10px] font-black text-white/90 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><IconThumbUp className="w-3 h-3" /> {likes}</span>
                        <span className="flex items-center gap-1"><IconDownload className="w-3 h-3" /> {downloads}</span>
                    </div>
                </div>
            </div>
            <div className="p-4 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-[13px] text-white leading-tight line-clamp-1 uppercase tracking-tight transition-colors">
                        {mod.title}
                    </h3>
                </div>
                {category && (
                    <span className="px-2 py-0.5 bg-zinc-800/50 rounded text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] w-fit">
                        {category}
                    </span>
                )}
            </div>
        </div>
    );
};

/** Минималистичная карточка списка: обложка, название/краткое описание, ровно 1 тег (Категория). */
export const ListCard: React.FC<CardProps> = ({ mod, gameSlug, onClick }) => {
    const { image, category, description, likes, downloads, views, relativeTime } = extractCardMeta(mod);

    return (
        <div
            className="bg-[#24262b] rounded-2xl overflow-hidden flex items-center gap-6 p-4 cursor-pointer transition-all"
            onClick={onClick}
        >
            <div className="w-40 h-24 rounded-xl overflow-hidden bg-[#101114] shrink-0 relative">
                <img
                    src={image}
                    className="w-full h-full object-cover"
                    alt={mod.title}
                />
            </div>
            <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-[16px] text-white leading-tight line-clamp-1 uppercase tracking-tight transition-colors">
                        {mod.title}
                    </h3>
                    {category && (
                        <span className="px-2 py-1 bg-zinc-800 rounded text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                            {category}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-[12px] text-zinc-400 line-clamp-1 font-medium mb-3 opacity-70">{description}</p>
                )}
                <div className="flex items-center gap-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 transition-colors">
                        <IconThumbUp className="w-3.5 h-3.5" /> {likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5 transition-colors">
                        <IconDownload className="w-3.5 h-3.5" /> {downloads.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5 transition-colors">
                        <IconVisibility className="w-3.5 h-3.5" /> {views.toLocaleString()}
                    </span>
                    <span className="ml-auto text-zinc-600 transition-colors">
                        {relativeTime}
                    </span>
                </div>
            </div>
        </div>
    );
};
