const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/;

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });
const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });

/**
 * Converte o valor salvo em `dueDate` em Date.
 * "2026-11-22T21:00" e "2026-11-22" são lidos no fuso local (o `new Date()` leria
 * a versão só com data em UTC, o que no Brasil mostraria o dia anterior).
 */
export function parseDueDate(value) {
    if (!value) return null;

    const match = LOCAL_DATE_TIME.exec(value);
    if (!match) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const [year, month, day, hour, minute, second] = match.slice(1).map((part) => Number(part ?? 0));
    const date = new Date(year, month - 1, day, hour, minute, second);
    const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

    return isRealDate ? date : null;
}

export function startOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

export function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}

export function isSameDay(a, b) {
    return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function getDueStatus(value, now = new Date()) {
    const date = parseDueDate(value);
    if (!date) return "no-date";
    if (date < now) return "overdue";
    if (isSameDay(date, now)) return "today";
    return "upcoming";
}

export function formatDueDate(value, now = new Date()) {
    const date = parseDueDate(value);
    if (!date) return "";

    const time = timeFormatter.format(date);
    const today = startOfDay(now);
    const day = startOfDay(date);
    const dayDifference = Math.round((day - today) / 86_400_000);

    if (dayDifference === 0) return `Hoje às ${time}`;
    if (dayDifference === 1) return `Amanhã às ${time}`;
    if (dayDifference === -1) return `Ontem às ${time}`;
    if (date.getFullYear() === now.getFullYear()) return `${shortDateFormatter.format(date)} às ${time}`;
    return `${fullDateFormatter.format(date)} às ${time}`;
}

export function formatLongDate(date) {
    return longDateFormatter.format(date);
}