
import React from 'react';
import {
    IconCalendar,
    IconDescription,
    IconDownload,
    IconSchedule,
    IconThumbUp,
    IconVisibility
} from '../UI/MaterialIcons';

interface SkinCardProps {
    mod: any;
    gameSlug?: string;
    badgeFields?: string[];
    badgeMax?: number;
    onClick: () => void;
}

const normalizeBadges = (mod: any, badgeFields?: string[], maxBadges: number = 6): string[] => {
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

export const SkinCard: React.FC<SkinCardProps> = ({ mod, badgeFields, badgeMax, onClick }) => {
    const stats = mod.stats || {};
    const downloads = stats.downloads ?? mod.downloads ?? 0;
    const likes = stats.likes ?? 0;
    const views = stats.views ?? 0;
    const createdAt = mod.created_at || mod.createdAt;
    const relativeTime = formatRelativeTime(createdAt);
    const fullDate = formatShortDate(createdAt);
    const image =
        mod.cover_url ||
        mod.banner_url ||
        (mod.gallery && mod.gallery[0]) ||
        `https://picsum.photos/seed/${mod.id || mod.slug}/400/600`;
    const description = mod.summary || mod.description || mod.desc || '';
    const category =
        mod.category ||
        mod.section_slug ||
        mod.attributes?.category ||
        mod.attributes?.type ||
        mod.attributes?.tag ||
        '';
    const fileSize = mod.attributes?.fileSize || mod.attributes?.size || '';
    const badges = normalizeBadges(mod, badgeFields, badgeMax);

    return (
        <div
            className="bg-[#202226] rounded-xl overflow-hidden flex flex-col group cursor-pointer transition-all hover:-translate-y-0.5"
            onClick={onClick}
        >
            <div className="relative aspect-[16/9] overflow-hidden bg-[#101114]">
                <img
                    src={image}
                    className="w-full h-full object-cover"
                    alt={mod.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            </div>

            <div className="flex-1 flex flex-col bg-[#202226]">
                <div className="px-4 pt-3 pb-2 space-y-1.5">
                    <h3 className="font-semibold text-[14px] text-white leading-snug line-clamp-2">
                        {mod.title}
                    </h3>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400">
                        <span className="truncate">by {mod.author_name || 'Unknown'}</span>
                        {category && (
                            <span className="px-2 py-0.5 bg-zinc-800/90 rounded-full text-[10px] text-zinc-100 truncate">
                                {category}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="mt-1 text-[12px] text-zinc-400 leading-snug line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>

                <div className="px-4 pb-2 flex items-center gap-4 text-[11px] text-zinc-500">
                    {relativeTime && (
                        <span className="inline-flex items-center gap-1.5">
                            <IconSchedule className="w-4 h-4 text-zinc-500" />
                            {relativeTime}
                        </span>
                    )}
                    {fullDate && (
                        <span className="inline-flex items-center gap-1.5">
                            <IconCalendar className="w-4 h-4 text-zinc-500" />
                            {fullDate}
                        </span>
                    )}
                </div>

                {badges.length > 0 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                            <span
                                key={b}
                                className="px-2 py-0.5 bg-white/5 text-[10px] rounded-full font-semibold text-zinc-200 max-w-full truncate"
                                title={b}
                            >
                                {b}
                            </span>
                        ))}
                    </div>
                )}

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
                        <span className="inline-flex items-center gap-1.5 text-zinc-200">
                            <IconDescription className="w-4 h-4 text-zinc-200" />
                            {fileSize}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
