
import React from 'react';
import { ViewType, SectionConfig, FilterOption } from '../../types';
import { GridCard, CompactCard, ListCard } from './StandardCards';
import { SkinCard } from './SkinCard';

interface CardViewMapperProps {
    mod: any;
    gameSlug: string;
    viewType: ViewType;
    viewMode: 'grid' | 'compact' | 'list';
    sectionConfig?: SectionConfig;
    previewFilterConfig?: FilterOption[];
    onClick: () => void;
}

export const CardViewMapper: React.FC<CardViewMapperProps> = ({
    mod,
    gameSlug,
    viewType,
    viewMode,
    sectionConfig,
    previewFilterConfig,
    onClick
}) => {
    const badgeFields = sectionConfig?.badgeFields;
    const badgeMax = sectionConfig?.badgeMax;

    if (viewType === 'skin') {
        return <SkinCard mod={mod} badgeFields={badgeFields} badgeMax={badgeMax} onClick={onClick} />;
    }

    switch (viewMode) {
        case 'compact':
            return <CompactCard mod={mod} gameSlug={gameSlug} badgeFields={badgeFields} badgeMax={badgeMax} previewFilterConfig={previewFilterConfig} onClick={onClick} />;
        case 'list':
            return <ListCard mod={mod} gameSlug={gameSlug} badgeFields={badgeFields} badgeMax={badgeMax} previewFilterConfig={previewFilterConfig} onClick={onClick} />;
        default:
            return <GridCard mod={mod} gameSlug={gameSlug} badgeFields={badgeFields} badgeMax={badgeMax} previewFilterConfig={previewFilterConfig} onClick={onClick} />;
    }
};
