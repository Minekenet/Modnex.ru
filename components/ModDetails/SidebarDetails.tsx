
import React from 'react';

const SidebarDetails: React.FC = () => {
  const details = [
    { label: 'Загрузки:', value: '130,674,912', isNumber: true },
    { label: 'Создан:', value: '5 лет назад' },
    { label: 'Обновлен:', value: '15 дней назад' },
    { label: 'Лицензия:', value: 'MIT License', isLink: true }
  ];

  return (
    <div className="bg-[#24262b] rounded-3xl p-10 shadow-xl space-y-8">
      <h4 className="text-[12px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8">Детали</h4>
      <div className="space-y-5">
        {details.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-[14px]">
            <span className="text-zinc-500 font-bold tracking-tight">{d.label}</span>
            <div className="flex items-center gap-3">
              <span className={`font-black text-zinc-300 ${d.isLink ? 'text-zinc-400 hover:text-white cursor-pointer transition-all border-b border-transparent hover:border-white' : ''}`}>
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
