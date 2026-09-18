export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_OF_WEEK_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(isoStr: string): Date {
  const [year, month, day] = isoStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Noon to prevent TZ skew
}

export function formatDisplayDate(isoStr: string): string {
  if (!isoStr) return '';
  const date = parseISODate(isoStr);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTimeSlot(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}

export function formatTime24to12(time24?: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const displayMinute = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
  return `${displayHour}${displayMinute} ${period}`;
}

export function addMinutesToTime(time24: string, minutesToAdd: number): string {
  const [hStr, mStr] = time24.split(':');
  const totalMins = parseInt(hStr, 10) * 60 + parseInt(mStr || '0', 10) + minutesToAdd;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export function calculateDurationMinutes(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 60;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  return Math.max(15, endMins - startMins);
}

// Generate Month Matrix (6 weeks x 7 days)
export type MonthGridDay = {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  weekNumber: number;
};

export function getMonthGrid(year: number, month: number, todayISO: string): MonthGridDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon...
  
  const startDate = new Date(year, month, 1 - startDayOfWeek);
  const grid: MonthGridDay[] = [];

  for (let i = 0; i < 42; i++) {
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const dateString = formatDateToISO(current);
    const dayNumber = current.getDate();
    const isCurrentMonth = current.getMonth() === month;
    const isToday = dateString === todayISO;
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Week number of year calculation
    const tempDate = new Date(current.getTime());
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);

    grid.push({
      date: current,
      dateString,
      dayNumber,
      isCurrentMonth,
      isToday,
      isWeekend,
      weekNumber,
    });
  }

  return grid;
}

// Generate Week Days (7 days for a given date)
export function getWeekDays(referenceDate: Date, todayISO: string): MonthGridDay[] {
  const dayOfWeek = referenceDate.getDay();
  const startOfWeek = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - dayOfWeek);
  
  const days: MonthGridDay[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
    const dateString = formatDateToISO(current);
    days.push({
      date: current,
      dateString,
      dayNumber: current.getDate(),
      isCurrentMonth: true,
      isToday: dateString === todayISO,
      isWeekend: i === 0 || i === 6,
      weekNumber: 1,
    });
  }
  return days;
}
