import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { adminService } from '../api/admin';
import { supportService, SupportMessage, SupportTicket } from '../api/support';

const AdminPage: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const { user, isLoggedIn } = useAuthStore();

    // Pagination States
    const [sugPage, setSugPage] = useState(1);
    const [repPage, setRepPage] = useState(1);
    const [tickPage, setTickPage] = useState(1);

    const limit = 20;

    const [suggestions, setSuggestions] = useState<{ items: any[], total: number }>({ items: [], total: 0 });
    const [reports, setReports] = useState<{ items: any[], total: number }>({ items: [], total: 0 });
    const [supportTickets, setSupportTickets] = useState<{ items: any[], total: number }>({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!isLoggedIn || (user?.role !== 'admin' && user?.role !== 'ADMIN')) {
            navigate('/', { replace: true });
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                const [sug, rep, tickets] = await Promise.all([
                    adminService.getGameSuggestions(sugPage, limit),
                    adminService.getReports(repPage, limit),
                    adminService.getSupportTickets(tickPage, limit)
                ]);
                setSuggestions(sug || { items: [], total: 0 });
                setReports(rep || { items: [], total: 0 });
                setSupportTickets(tickets || { items: [], total: 0 });
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isLoggedIn, user?.role, navigate, sugPage, repPage, tickPage]);

    const openTicketModal = async (ticket: any) => {
        setSelectedTicket(ticket);
        try {
            const msgs = await supportService.getMessages(ticket.id);
            setMessages(msgs);
        } catch (err) {
            console.error(err);
            setMessages([]);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || sending || !selectedTicket) return;
        setSending(true);
        try {
            const msg = await supportService.sendMessage(selectedTicket.id, replyText.trim());
            setMessages(prev => [...prev, msg]);
            setReplyText('');
        } catch (err) {
            console.error(err);
            alert('Ошибка отправки ответа');
        } finally {
            setSending(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedTicket) return;
        const newStatus = selectedTicket.status === 'open' ? 'closed' : 'open';
        try {
            await adminService.changeTicketStatus(selectedTicket.id, newStatus);
            setSelectedTicket({ ...selectedTicket, status: newStatus });
            setSupportTickets(prev => ({
                ...prev,
                items: prev.items.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus } : t)
            }));
        } catch (err) {
            console.error(err);
            alert('Ошибка смены статуса');
        }
    };

    if (!isLoggedIn) return null;

    return (
        <div className="min-h-screen bg-[#1c1c1f] text-white py-24 px-8 font-['Inter',_sans-serif]">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl font-black uppercase tracking-tight">Панель управления</h1>
                    <ReactRouterDOM.Link to="/" className="text-white/80 hover:text-white text-sm font-bold uppercase tracking-wider no-underline">На главную</ReactRouterDOM.Link>
                </div>

                {loading && <p className="text-white/70 mb-4">Данные обновляются...</p>}
                {error && <p className="text-red-400 mb-4">{error}</p>}

                <div className="space-y-12">
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Заявки на игры</h2>
                            <div className="flex gap-2">
                                <button disabled={sugPage === 1} onClick={() => setSugPage(p => p - 1)} className="px-3 py-1 bg-[#24262b] text-xs font-bold uppercase rounded-lg disabled:opacity-50">Назад</button>
                                <span className="text-xs text-white/50 flex items-center">Стр {sugPage} (Всего: {suggestions.total})</span>
                                <button disabled={sugPage * limit >= suggestions.total} onClick={() => setSugPage(p => p + 1)} className="px-3 py-1 bg-[#24262b] text-xs font-bold uppercase rounded-lg disabled:opacity-50">Вперед</button>
                            </div>
                        </div>
                        <div className="bg-[#24262b] rounded-2xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Название</th>
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Ссылка</th>
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Комментарий</th>
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Дата</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suggestions.items.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-white/50 text-center">Нет заявок</td></tr>
                                    ) : (
                                        suggestions.items.map((row) => (
                                            <tr key={row.id} className="border-b border-white/5">
                                                <td className="p-4 font-bold text-white">{row.title}</td>
                                                <td className="p-4 text-white/80 text-sm">{row.link || '—'}</td>
                                                <td className="p-4 text-white/80 text-sm max-w-xs truncate">{row.comment || '—'}</td>
                                                <td className="p-4 text-white/60 text-sm">{row.created_at ? new Date(row.created_at).toLocaleDateString('ru-RU') : '—'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Тикеты поддержки</h2>
                            <div className="flex gap-2">
                                <button disabled={tickPage === 1} onClick={() => setTickPage(p => p - 1)} className="px-3 py-1 bg-[#24262b] text-xs font-bold uppercase rounded-lg disabled:opacity-50">Назад</button>
                                <span className="text-xs text-white/50 flex items-center">Стр {tickPage} (Всего: {supportTickets.total})</span>
                                <button disabled={tickPage * limit >= supportTickets.total} onClick={() => setTickPage(p => p + 1)} className="px-3 py-1 bg-[#24262b] text-xs font-bold uppercase rounded-lg disabled:opacity-50">Вперед</button>
                            </div>
                        </div>
                        <div className="bg-[#24262b] rounded-2xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Тема</th>
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Пользователь</th>
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Статус</th>
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Обновлён</th>
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest text-right">Действие</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supportTickets.items.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-white/50 text-center">Нет тикетов</td></tr>
                                    ) : (
                                        supportTickets.items.map((row) => (
                                            <tr key={row.id} className="border-b border-white/5">
                                                <td className="p-4 font-bold text-white max-w-[200px] truncate">{row.subject}</td>
                                                <td className="p-4 text-white/80 text-sm">{row.username || '—'}</td>
                                                <td className="p-4 text-white/80 text-sm">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${row.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{row.status}</span>
                                                </td>
                                                <td className="p-4 text-white/60 text-sm">{row.updated_at ? new Date(row.updated_at).toLocaleDateString('ru-RU') : '—'}</td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => openTicketModal(row)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase rounded-lg border-none cursor-pointer hover:bg-blue-500 transition-colors">Ответить</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Жалобы</h2>
                            <div className="flex gap-2">
                                <button disabled={repPage === 1} onClick={() => setRepPage(p => p - 1)} className="px-3 py-1 bg-[#24262b] text-xs font-bold uppercase rounded-lg disabled:opacity-50">Назад</button>
                                <span className="text-xs text-white/50 flex items-center">Стр {repPage} (Всего: {reports.total})</span>
                                <button disabled={repPage * limit >= reports.total} onClick={() => setRepPage(p => p + 1)} className="px-3 py-1 bg-[#24262b] text-xs font-bold uppercase rounded-lg disabled:opacity-50">Вперед</button>
                            </div>
                        </div>
                        <div className="bg-[#24262b] rounded-2xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Проект</th>
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Причина</th>
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Комментарий</th>
                                        <th className="p-4 text-[10px] font-black text-white/70 uppercase tracking-widest">Дата</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.items.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-white/50 text-center">Нет жалоб</td></tr>
                                    ) : (
                                        reports.items.map((row) => (
                                            <tr key={row.id} className="border-b border-white/5">
                                                <td className="p-4 font-bold text-white">{row.item_title || row.item_id}</td>
                                                <td className="p-4 text-white/80">{row.reason}</td>
                                                <td className="p-4 text-white/80 text-sm max-w-xs truncate">{row.comment || '—'}</td>
                                                <td className="p-4 text-white/60 text-sm">{row.created_at ? new Date(row.created_at).toLocaleDateString('ru-RU') : '—'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>

            {/* Modal for viewing and messaging on support tickets */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1b23] w-full max-w-lg rounded-2xl border border-white/10 flex flex-col max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-white uppercase tracking-tight truncate max-w-[300px]">{selectedTicket.subject}</h3>
                                <p className="text-xs text-white/50 mt-1 uppercase font-bold">Статус: {selectedTicket.status}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="text-zinc-500 hover:text-white bg-transparent border-none cursor-pointer">
                                ✖
                            </button>
                        </div>

                        <div className="flex-grow p-6 overflow-y-auto space-y-4">
                            {messages.map(m => (
                                <div key={m.id} className={`flex flex-col ${m.is_staff ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-2.5 rounded-xl text-sm ${m.is_staff ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#24262b] text-zinc-300 rounded-tl-none border border-white/5'}`}>
                                        {m.body}
                                    </div>
                                    <span className="text-[10px] text-zinc-500 mt-1">{m.is_staff ? 'Админ' : m.author_name || 'Пользователь'}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-white/5 bg-[#24262b]">
                            <form onSubmit={handleSendReply} className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Введите ответ..."
                                    className="flex-grow bg-[#1a1b23] border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none"
                                />
                                <button disabled={sending || !replyText.trim()} type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs uppercase rounded-lg disabled:opacity-50 border-none cursor-pointer">
                                    {sending ? '...' : 'Ответить'}
                                </button>
                            </form>
                            <div className="mt-4 text-center">
                                <button onClick={handleToggleStatus} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase rounded-lg border-none cursor-pointer transition-colors w-full">
                                    {selectedTicket.status === 'open' ? 'Закрыть тикет' : 'Открыть тикет'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
