
import React from 'react';
import { ViewType } from '../../types';
import { GridCard, CompactCard, ListCard } from './StandardCards';
import { SkinCard } from './SkinCard';

interface CardViewMapperProps {
    mod: any;
    gameSlug: string;
    viewType: ViewType;
    viewMode: 'grid' | 'compact' | 'list';
    onClick: () => void;
}

export const CardViewMapper: React.FC<CardViewMapperProps> = ({
    mod,
    gameSlug,
    viewType,
    viewMode,
    onClick
}) => {
    // If viewType is specifically 'skin', always use SkinCard regardless of viewMode toggles
    if (viewType === 'skin') {
        return <SkinCard mod={mod} onClick={onClick} />;
    }

    // Otherwise, use standard cards based on viewMode toggle
    switch (viewMode) {
        case 'compact':
            return <CompactCard mod={mod} gameSlug={gameSlug} onClick={onClick} />;
        case 'list':
            return <ListCard mod={mod} gameSlug={gameSlug} onClick={onClick} />;
        default:
            return <GridCard mod={mod} gameSlug={gameSlug} onClick={onClick} />;
    }
};
