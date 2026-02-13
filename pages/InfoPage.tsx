
import React, { useEffect, useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

type InfoType = 'rules' | 'privacy' | 'publish' | 'dmca' | 'terms';

interface InfoPageProps {
  type: InfoType;
}

const InfoPage: React.FC<InfoPageProps> = ({ type }) => {
  const [activeSection, setActiveSection] = useState('');

  const contentMap = useMemo(() => ({
    rules: {
      title: 'Правила сообщества',
      description: 'Свод правил поведения и использования платформы в соответствии с законодательством РФ.',
      sections: [
        { 
          id: 'general', 
          title: '1. Общие положения', 
          text: 'Настоящие правила разработаны в соответствии с ФЗ №149-ФЗ «Об информации, информационных технологиях и о защите информации». Платформа MODNEX является открытой площадкой, однако администрация оставляет за собой право модерировать контент для обеспечения безопасности пользователей.' 
        },
        { 
          id: 'prohibited', 
          title: '2. Запрещенный контент', 
          text: 'Строго запрещена публикация материалов, содержащих: призывы к экстремистской деятельности, информацию о способах изготовления и использования наркотических средств, материалы порнографического характера, а также контент, нарушающий ФЗ №436-ФЗ «О защите детей от информации, причиняющей вред их здоровью».' 
        },
        { 
          id: 'copyright', 
          title: '3. Интеллектуальная собственность', 
          text: 'Пользователи обязаны соблюдать IV часть Гражданского кодекса РФ. Размещение чужих модификаций без указания авторства или разрешения правообладателя приравнивается к плагиату и влечет за собой удаление контента.' 
        },
        { 
          id: 'interaction', 
          title: '4. Поведение и общение', 
          text: 'Запрещены любые формы дискриминации, нецензурная брань, оскорбления достоинства личности, угрозы и публикация персональных данных третьих лиц без их согласия.' 
        },
        { 
          id: 'sanctions', 
          title: '5. Санкции и модерация', 
          text: 'За нарушение правил предусмотрены следующие меры: предупреждение, временная блокировка аккаунта (от 24 часов до 30 дней) или бессрочная блокировка (перманентный бан) в случае грубых нарушений законодательства РФ.' 
        },
        { 
          id: 'disputes', 
          title: '6. Разрешение споров', 
          text: 'Все претензии по работе сервиса или действиям модераторов принимаются через официальный тикет-центр или по адресу support@modnex.project.' 
        }
      ]
    },
    publish: {
      title: 'Регламент публикации',
      description: 'Правила размещения модификаций и контента на платформе MODNEX.',
      sections: [
        { id: 'p1', title: 'Авторское право', text: 'Загружая контент, Пользователь гарантирует, что является законным правообладателем или имеет лицензию на сублицензирование. Запрещен плагиат и повторная публикация без разрешения.' },
        { id: 'p2', title: 'Безопасность файлов', text: 'Каждый исполняемый файл проходит автоматическую проверку. Запрещено внедрение майнеров, троянов, фишинговых скриптов и любого вредоносного ПО. Нарушение ведет к вечной блокировке.' },
        { id: 'p3', title: 'Технические требования', text: 'Описание должно быть на русском или английском языке, содержать актуальные скриншоты и корректную инструкцию по установке.' }
      ]
    },
    privacy: {
      title: 'Конфиденциальность',
      description: 'Политика обработки персональных данных в соответствии с 152-ФЗ РФ.',
      sections: [
        { id: 'pr1', title: 'Сбор данных', text: 'Мы собираем только необходимые данные: e-mail, IP-адрес и куки для обеспечения безопасности и работоспособности сервиса.' },
        { id: 'pr2', title: 'Цели обработки', text: 'Персональные данные используются для авторизации, персонализации контента и предотвращения мошеннических действий.' },
        { id: 'pr3', title: 'Передача третьим лицам', text: 'MODNEX не продает данные пользователей. Передача возможна только по официальному запросу правоохранительных органов РФ.' }
      ]
    },
    dmca: {
      title: 'Правообладателям',
      description: 'Процедура уведомления о нарушении авторских прав (DMCA & ГК РФ).',
      sections: [
        { id: 'd1', title: 'Статус посредника', text: 'MODNEX является информационным посредником в соответствии со ст. 1253.1 ГК РФ. Мы не инициируем загрузку и не выбираем получателя контента.' },
        { id: 'd2', title: 'Подача жалобы', text: 'Жалоба должна содержать: ссылку на оригинал, ссылку на нарушение на нашем сайте и подтверждение ваших прав. Письма направлять на abuse@modnex.project' },
        { id: 'd3', title: 'Сроки обработки', text: 'Мы обязуемся ограничить доступ к спорному контенту в течение 24-48 рабочих часов после получения валидного уведомления.' }
      ]
    },
    terms: {
      title: 'Условия использования',
      description: 'Публичная оферта и правила пользования сервисом MODNEX.',
      sections: [
        { id: 't1', title: 'Принятие условий', text: 'Использование сайта означает полное и безоговорочное согласие с текущими Условиями. Если вы не согласны, пожалуйста, прекратите использование.' },
        { id: 't2', title: 'Ограничение ответственности', text: 'MODNEX предоставляет сервис "как есть". Мы не несем ответственности за косвенные убытки или потерю данных в результате использования ПО.' }
      ]
    }
  }), []);

  const data = contentMap[type];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (data && data.sections.length > 0) {
      setActiveSection(data.sections[0].id);
    }
  }, [type, data]);

  if (!data) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c1f] text-white selection:bg-white selection:text-black font-['Inter',_sans-serif]">
      <div className="max-w-[1400px] mx-auto px-8 py-24 flex flex-col lg:flex-row gap-16">
        
        {/* Left Sidebar Navigation */}
        <aside className="lg:w-80 shrink-0">
          <div className="sticky top-24 space-y-12">
            <div>
              <div className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6">Legal Hub</div>
              <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">{data.title}</h1>
              <p className="text-zinc-500 font-bold text-[13px] uppercase tracking-wider leading-relaxed">{data.description}</p>
            </div>

            <nav className="flex flex-col gap-1">
              {data.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`group flex items-center gap-4 py-3 text-left border-none bg-transparent cursor-pointer transition-all ${
                    activeSection === section.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className={`h-[2px] transition-all duration-300 ${
                    activeSection === section.id ? 'w-8 bg-white' : 'w-0 bg-zinc-700 group-hover:w-4'
                  }`}></div>
                  <span className="text-[12px] font-black uppercase tracking-widest">{section.title}</span>
                </button>
              ))}
            </nav>

            <div className="pt-8 border-t border-white/5">
              <ReactRouterDOM.Link 
                to="/" 
                className="text-zinc-500 hover:text-white font-black text-[11px] uppercase tracking-widest no-underline transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Вернуться назад
              </ReactRouterDOM.Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow max-w-3xl lg:pt-2">
          <div className="space-y-32">
            {data.sections.map((section) => (
              <section 
                key={section.id} 
                id={section.id} 
                className="scroll-mt-32 transition-opacity duration-500"
                onMouseEnter={() => setActiveSection(section.id)}
              >
                <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-baseline gap-4">
                  <span className="text-zinc-800 text-4xl select-none font-black opacity-20 tracking-tighter">
                    {section.id.includes('general') ? '01' : 
                     section.id.includes('prohibited') ? '02' : 
                     section.id.includes('copyright') ? '03' : 
                     section.id.includes('interaction') ? '04' : 
                     section.id.includes('sanctions') ? '05' : 'SEC'}
                  </span>
                  {section.title}
                </h2>
                <div className="relative pl-8 border-l border-zinc-800">
                  <p className="text-zinc-400 text-[17px] leading-relaxed font-medium">
                    {section.text}
                  </p>
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-40 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
              Update: January 2026 • Legal Division
            </span>
            <div className="flex gap-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">RU-LAW COMPLIANT</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">MODNEX-002</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default InfoPage;
