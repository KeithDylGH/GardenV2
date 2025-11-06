import { AppState, Achievement } from './types';
import { getServiceYear, formatDateKey } from './utils';
import { GardenIcon } from './components/icons/GardenIcon';
import { FireIcon } from './components/icons/FireIcon';
import { AcademicCapIcon } from './components/icons/AcademicCapIcon';
import { ArrowTrendingUpIcon } from './components/icons/ArrowTrendingUpIcon';
import { TrophyIcon } from './components/icons/TrophyIcon';
import { ArrowUturnLeftIcon } from './components/icons/ArrowUturnLeftIcon';
import { UsersIcon } from './components/icons/UsersIcon';
import { ChartBarIcon } from './components/icons/ChartBarIcon';
import { BuildingOfficeIcon } from './components/icons/BuildingOfficeIcon';
import { BoltIcon } from './components/icons/BoltIcon';
import { CalendarDaysIcon } from './components/icons/CalendarDaysIcon';
import { MegaphoneIcon } from './components/icons/MegaphoneIcon';


export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_log',
    title: 'Primeros Pasos',
    description: () => `Registra tu primera hora de servicio.`,
    icon: GardenIcon,
    tiers: [1],
    check: (state: AppState) => {
      let hasAnyHours = false;
      for (const year in state.archives) {
        if (Object.values(state.archives[year]).some(entry => entry.hours > 0)) {
          hasAnyHours = true;
          break;
        }
      }
      return { unlocked: hasAnyHours, currentProgress: hasAnyHours ? 1 : 0 };
    },
  },
  {
    id: 'streak',
    title: 'Racha Imparable',
    description: (tier) => `Mantén una racha de ${tier} días de servicio.`,
    icon: FireIcon,
    tiers: [7, 14, 30, 60, 100],
    check: (state: AppState) => {
      return { unlocked: state.streak >= 7, currentProgress: state.streak };
    },
  },
  {
    id: 'total_studies',
    title: 'Maestro Dedicado',
    description: (tier) => `Alcanza un total de ${tier} estudios bíblicos.`,
    icon: AcademicCapIcon,
    tiers: [1, 3, 5, 10],
    check: (state: AppState) => {
      const studyCount = state.activities.filter(act => act.type === 'study').length;
      return { unlocked: studyCount >= 1, currentProgress: studyCount };
    },
  },
  {
    id: 'total_revisits',
    title: 'Visitante Frecuente',
    description: (tier) => `Alcanza un total de ${tier} revisitas.`,
    icon: UsersIcon,
    tiers: [3, 10, 25, 50, 100],
    check: (state: AppState) => {
        const visitCount = state.activities.filter(act => act.type === 'visit').length;
        return { unlocked: visitCount >= 3, currentProgress: visitCount };
    }
  },
  {
    id: 'monthly_hours',
    title: 'Maratón Mensual',
    description: (tier) => `Alcanza ${tier} horas en un solo mes.`,
    icon: TrophyIcon,
    tiers: [60, 80, 100, 120],
    check: (state: AppState) => {
        return { unlocked: state.currentHours >= 60, currentProgress: state.currentHours };
    }
  },
  {
    id: 'monthly_revisits',
    title: 'Pastor Diligente',
    description: (tier) => `Realiza ${tier} revisitas en un mes.`,
    icon: ArrowUturnLeftIcon,
    tiers: [5, 10, 20],
    check: (state: AppState) => {
        const currentDate = new Date(state.currentDate);
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const count = state.activities.filter(act => {
            const actDate = new Date(act.date);
            return act.type === 'visit' && actDate.getMonth() === currentMonth && actDate.getFullYear() === currentYear;
        }).length;
        return { unlocked: count >= 5, currentProgress: count };
    }
  },
  {
    id: 'goal_smasher',
    title: 'Más Allá de la Meta',
    description: (tier) => `Supera tu meta mensual por un ${tier}%.`,
    icon: ArrowTrendingUpIcon,
    tiers: [50, 100],
    check: (state: AppState) => {
      const progress = state.goal > 0 ? (state.currentHours / state.goal) * 100 : 0;
      const surplus = Math.max(0, progress - 100);
      return { unlocked: surplus >= 50, currentProgress: Math.floor(surplus) };
    },
  },
  {
    id: 'total_hours',
    title: 'Misionero Urbano',
    description: (tier) => `Alcanza un total de ${tier} horas de servicio.`,
    icon: ChartBarIcon,
    tiers: [250, 500, 1000, 2000],
    check: (state: AppState) => {
        let totalHours = 0;
        for (const year in state.archives) {
            for (const dateKey in state.archives[year]) {
                totalHours += state.archives[year][dateKey].hours || 0;
            }
        }
        return { unlocked: totalHours >= 250, currentProgress: totalHours };
    }
  },
  {
    id: 'ldc_hours_total',
    title: 'Constructor del Reino',
    description: (tier) => `Registra un total de ${tier} horas LDC.`,
    icon: BuildingOfficeIcon,
    tiers: [8, 40, 100, 250],
    check: (state: AppState) => {
        let totalLdcHours = 0;
        for (const year in state.archives) {
            for (const dateKey in state.archives[year]) {
                totalLdcHours += state.archives[year][dateKey].ldcHours || 0;
            }
        }
        return { unlocked: totalLdcHours >= 8, currentProgress: totalLdcHours };
    }
  },
  {
    id: 'weather_warrior',
    title: 'Lluvia o Sol',
    description: (tier) => `Sal a predicar ${tier} días con mal tiempo en un mes.`,
    icon: BoltIcon,
    tiers: [5, 10],
    check: (state: AppState) => {
        const currentDate = new Date(state.currentDate);
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const history = state.archives[state.currentServiceYear] || {};
        const count = Object.values(history).filter(entry => {
            if (!entry.weather || entry.weather !== 'bad') return false;
            const entryDateKey = Object.keys(history).find(key => history[key] === entry);
            if (!entryDateKey) return false;
            const entryDate = new Date(entryDateKey);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        }).length;
        return { unlocked: count >= 5, currentProgress: count };
    }
  },
  {
    id: 'perfect_week',
    title: 'Semana Perfecta',
    description: () => `Registra horas todos los días no protegidos de una semana.`,
    icon: CalendarDaysIcon,
    tiers: [1],
    check: (state: AppState) => {
        const today = new Date();
        let success = true;
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() - i);
            const dayOfWeek = checkDate.getDay();
            const isProtected = dayOfWeek === 0 || dayOfWeek === 6 || (state.protectedDay !== null && dayOfWeek === state.protectedDay);
            
            if (isProtected) continue;

            const dateKey = formatDateKey(checkDate);
            const serviceYear = getServiceYear(checkDate);
            const history = state.archives[serviceYear] || {};
            const hasHours = history[dateKey] && history[dateKey].hours > 0;

            if (!hasHours) {
                success = false;
                break;
            }
        }
        return { unlocked: success, currentProgress: success ? 1 : 0 };
    }
  },
  {
    id: 'campaign_supporter',
    title: 'Fiel en la Campaña',
    description: (tier) => `Participa en ${tier} días de campaña.`,
    icon: MegaphoneIcon,
    tiers: [3, 5, 10],
    check: (state: AppState) => {
      let campaignDays = 0;
      for (const year in state.archives) {
        for (const dateKey in state.archives[year]) {
          if (state.archives[year][dateKey].isCampaign) {
            campaignDays++;
          }
        }
      }
      return { unlocked: campaignDays >= 3, currentProgress: campaignDays };
    }
  }
];
