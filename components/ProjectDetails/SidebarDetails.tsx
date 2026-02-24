
import React from 'react';
import { formatRussianDate } from '../../utils/formatters';

interface SidebarDetailsProps {
  attributes?: Record<string, any>;
  stats?: {
    downloads?: string | number;
    likes?: string | number;
  };
  createdAt?: string;
  updatedAt?: string;
}

const formatAttrValue = (value: unknown): string => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(v => String(v)).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const labelFromKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
};

const SidebarDetails: React.FC<SidebarDetailsProps> = ({
  attributes = {},
  stats,
  createdAt,
  updatedAt
}) => {
  const staticDetails = [
    { label: 'Загрузки', value: String(stats?.downloads ?? '0') },
    { label: 'Создан', value: formatRussianDate(createdAt) },
    { label: 'Обновлен', value: formatRussianDate(updatedAt) },
  ];

  const dynamicDetails = Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => ({ label: labelFromKey(key), value: formatAttrValue(value) }));

  return (
    <div className="bg-[#24262b] rounded-3xl p-10 shadow-xl space-y-8">
      <h4 className="text-[12px] font-black text-white/70 uppercase tracking-[0.3em] mb-8">Детали проекта</h4>
      <div className="space-y-5">
        {staticDetails.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-[14px]">
            <span className="text-white/70 font-bold tracking-tight">{d.label}</span>
            <span className="font-black text-white">{d.value}</span>
          </div>
        ))}
      </div>
      {dynamicDetails.length > 0 && (
        <>
          <h4 className="text-[12px] font-black text-white/70 uppercase tracking-[0.3em] mb-8 pt-4 border-t border-white/10">Дополнительная информация</h4>
          <div className="space-y-5">
            {dynamicDetails.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-[14px]">
                <span className="text-white/70 font-bold tracking-tight">{d.label}</span>
                <span className="font-black text-white text-right max-w-[60%]">{d.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SidebarDetails;
