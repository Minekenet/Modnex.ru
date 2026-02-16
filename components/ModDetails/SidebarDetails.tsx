
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

const SidebarDetails: React.FC<SidebarDetailsProps> = ({
  attributes = {},
  stats,
  createdAt,
  updatedAt
}) => {
  const details = [
    { label: 'Загрузки:', value: stats?.downloads || '0' },
    { label: 'Создан:', value: formatRussianDate(createdAt) },
    { label: 'Обновлен:', value: formatRussianDate(updatedAt) },
  ];

  // Add dynamic attributes from JSONB
  Object.entries(attributes).forEach(([key, value]) => {
    if (value) {
      details.push({
        label: `${key.charAt(0).toUpperCase() + key.slice(1)}:`,
        value: String(value)
      });
    }
  });

  return (
    <div className="bg-[#24262b] rounded-3xl p-10 shadow-xl space-y-8">
      <h4 className="text-[12px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8">Детали проекта</h4>
      <div className="space-y-5">
        {details.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-[14px]">
            <span className="text-zinc-500 font-bold tracking-tight">{d.label}</span>
            <div className="flex items-center gap-3">
              <span className="font-black text-zinc-300">
                {d.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarDetails;
