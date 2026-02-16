
/**
 * Formats a date string into a Russian long format (e.g., "16 февраля 2026")
 */
export const formatRussianDate = (dateString?: string): string => {
    if (!dateString) return 'Неизвестно';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date).replace(' г.', '');
    } catch (e) {
        return 'Неизвестно';
    }
};
