
import React from 'react';
import { DetailsType } from '../../types';
import { StandardDetails } from './StandardDetails';
import { SkinDetails } from './SkinDetails';

interface DetailsLayoutMapperProps {
    detailsType: DetailsType;
    modData: any;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    setSelectedImageIndex: (index: number) => void;
    isOwner: boolean;
    tabs: string[];
    modId?: string;
}

export const DetailsLayoutMapper: React.FC<DetailsLayoutMapperProps> = ({
    detailsType,
    ...props
}) => {
    switch (detailsType) {
        case 'skin':
            return <SkinDetails {...props} />;
        default:
            return <StandardDetails {...props} />;
    }
};
