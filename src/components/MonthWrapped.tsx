import React, { useState, useEffect } from "react";
import { ThemeColor, DayEvent } from "../types";
import { THEMES } from "../constants";
import { SparklesIcon } from "./icons/SparklesIcon";

import { HomeIcon } from "./icons/HomeIcon";
import { BuildingOfficeIcon } from "./icons/BuildingOfficeIcon";
import { MegaphoneIcon } from "./icons/MegaphoneIcon";
import { MedicalIcon } from "./icons/MedicalIcon";

interface MonthWrappedProps {
    isOpen: boolean;
    onClose: () => void;
    year: number;
    month: number;
    stats: {
        hours: number;
        placements: number;
        videos: number;
        returnVisits: number;
        bibleStudies: number;
        ldcHours: number;
        events: DayEvent[];
        bestDay?: { date: string, hours: number } | null;
        mostProductiveDayOfWeek?: string | null;
        daysPreached: number;
        consistency: number;
        dailyAverage: number;
        previousMonth?: { hours: number; daysPreached: number } | null;
    };
    themeColor: ThemeColor;
}

const SLIDE_DURATION = 5000;

// Decorative floating circles component
const FloatingCircles: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
    </div>
);

const MonthWrapped: React.FC<MonthWrappedProps> = ({
    isOpen,
    onClose,
    year,
    month,
    stats,
    themeColor,
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Define slides based on available data
    const slides = [
        "intro",
        "hours",
        stats.daysPreached > 0 ? "consistency" : null,
        stats.dailyAverage > 0 ? "dailyAverage" : null,
        stats.bestDay ? "bestDay" : null,
        stats.mostProductiveDayOfWeek ? "dayOfWeek" : null,
        stats.previousMonth ? "comparison" : null,
        (stats.placements > 0 || stats.videos > 0) ? "ministry" : null,
        (stats.returnVisits > 0 || stats.bibleStudies > 0) ? "teaching" : null,
        stats.ldcHours > 0 ? "ldc" : null,
        stats.events.length > 0 ? "events" : null,
        "outro",
    ].filter(Boolean) as string[];

    const monthName = new Date(year, month).toLocaleDateString("es-ES", { month: "long" });

    // Elegant, deeper gradients with noise texture hint (simulated by color depth)
    const getBackground = (slide: string) => {
        switch (slide) {
            case "intro": return "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900";
            case "hours": return "bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900";
            case "consistency": return "bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900";
            case "dailyAverage": return "bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900";
            case "bestDay": return "bg-gradient-to-br from-slate-900 via-fuchsia-950 to-slate-900";
            case "dayOfWeek": return "bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900";
            case "comparison": return "bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900";
            case "ministry": return "bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900";
            case "teaching": return "bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900";
            case "ldc": return "bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900";
            case "events": return "bg-gradient-to-br from-slate-900 via-gray-900 to-black";
            case "outro": return "bg-gradient-to-br from-slate-950 via-gray-950 to-black";
            default: return "bg-black";
        }
    };

    useEffect(() => {
        if (isOpen) {
            setCurrentSlide(0);
            setIsPaused(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || isPaused) return;

        const timer = setTimeout(() => {
            handleNext();
        }, SLIDE_DURATION);

        return () => clearTimeout(timer);
    }, [currentSlide, isOpen, isPaused]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'ArrowRight' || e.key === ' ') handleNext();
            else if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentSlide]);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide((prev) => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide((prev) => prev - 1);
        }
    };

    if (!isOpen) return null;

    const currentSlideType = slides[currentSlide];
    const hoursChange = stats.previousMonth ? stats.hours - stats.previousMonth.hours : 0;
    const isImprovement = hoursChange > 0;

    return (
        <div className={`fixed inset-0 z-[60] text-white flex flex-col transition-all duration-700 ease-in-out font-sans ${getBackground(currentSlideType)}`}>
            <FloatingCircles />

            {/* Progress Bars */}
            <div className="flex gap-1.5 p-4 pt-6 safe-area-top z-20">
                {slides.map((_, index) => (
                    <div key={index} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                        <div
                            className={`h-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-100 ease-linear ${index < currentSlide ? "w-full" : index === currentSlide ? "w-full animate-progress" : "w-0"
                                }`}
                            style={{
                                animationDuration: index === currentSlide ? `${SLIDE_DURATION}ms` : '0s',
                                animationPlayState: isPaused ? 'paused' : 'running',
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-2 z-20 text-white/80">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm tracking-wide capitalize">
                        {monthName} {year}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                        {isPaused ? '▶' : '⏸'}
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
                >
                    <span className="text-xl leading-none">✕</span>
                </button>
            </div>

            {/* Slide Content */}
            <div
                className="flex-1 relative flex items-center justify-center p-6 z-10"
                onClick={(e) => {
                    const width = e.currentTarget.offsetWidth;
                    const x = e.clientX;
                    if (x < width / 3) handlePrev();
                    else handleNext();
                }}
            >
                <div key={currentSlideType} className="text-left w-full max-w-md animate-fade-in-up">

                    {currentSlideType === "intro" && (
                        <div className="space-y-12">
                            <h1 className="text-5xl font-bold mb-4 tracking-tight">
                                ¡Tu Mes<br />en Resumen!
                            </h1>
                            <div className="relative w-40 h-40">
                                <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl animate-pulse-slow" />
                                <div className="relative w-40 h-40 bg-gradient-to-tr from-white/10 to-transparent backdrop-blur-md rounded-full flex items-center justify-center text-6xl ring-1 ring-white/20 shadow-2xl">
                                    📅
                                </div>
                            </div>
                            <p className="text-2xl font-medium text-white/90">
                                Así fue tu servicio en <span className="capitalize text-indigo-300">{monthName}</span>
                            </p>
                        </div>
                    )}

                    {currentSlideType === "hours" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-medium text-blue-200 tracking-wide">TIEMPO DEDICADO</h2>
                            <div className="flex flex-col items-start justify-center py-4">
                                <div className="relative">
                                    <span className="text-[9rem] leading-none font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-xl">
                                        {Math.floor(stats.hours)}
                                    </span>
                                </div>
                                <span className="text-3xl font-medium text-white/90 mt-2">
                                    {stats.hours === 1 ? 'Hora' : 'Horas'}
                                </span>
                                {stats.hours % 1 !== 0 && (
                                    <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-full px-6 py-2 ring-1 ring-white/20">
                                        <span className="text-xl font-semibold">
                                            +{Math.round((stats.hours % 1) * 60)} minutos
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-lg text-white/70 font-normal mt-4">Cada minuto cuenta 🕰️</p>
                        </div>
                    )}

                    {currentSlideType === "consistency" && (
                        <div className="space-y-12">
                            <h2 className="text-xl font-medium text-emerald-200 tracking-wide">CONSTANCIA</h2>
                            <div className="relative w-64 h-64">
                                <svg className="w-64 h-64 transform -rotate-90">
                                    <circle cx="128" cy="128" r="110" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle
                                        cx="128"
                                        cy="128"
                                        r="110"
                                        fill="none"
                                        stroke="url(#gradient-consistency)"
                                        strokeWidth="8"
                                        strokeDasharray={`${2 * Math.PI * 110}`}
                                        strokeDashoffset={`${2 * Math.PI * 110 * (1 - stats.consistency / 100)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    />
                                    <defs>
                                        <linearGradient id="gradient-consistency" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#34d399" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <div className="text-6xl font-bold tracking-tight">{stats.consistency}%</div>
                                    <div className="text-sm font-medium text-white/60 mt-1">de los días</div>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl ring-1 ring-white/10">
                                <p className="text-lg text-white/90">
                                    Saliste a predicar <span className="font-bold text-emerald-300">{stats.daysPreached}</span> días este mes
                                </p>
                            </div>
                        </div>
                    )}

                    {currentSlideType === "dailyAverage" && (
                        <div className="space-y-12">
                            <h2 className="text-xl font-medium text-cyan-200 tracking-wide">PROMEDIO DIARIO</h2>
                            <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl p-10 rounded-[2rem] ring-1 ring-white/10 shadow-2xl">
                                <div className="text-7xl mb-6">📊</div>
                                <div className="text-7xl font-bold tracking-tighter text-white mb-2">
                                    {stats.dailyAverage.toFixed(1)}
                                </div>
                                <div className="text-xl font-medium text-white/70">horas / sesión</div>
                            </div>
                            <p className="text-lg text-white/70">
                                Tu dedicación constante es inspiradora
                            </p>
                        </div>
                    )}

                    {currentSlideType === "bestDay" && stats.bestDay && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-medium text-fuchsia-200 tracking-wide">TU MEJOR DÍA</h2>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-fuchsia-500/20 rounded-[2.5rem] blur-xl group-hover:bg-fuchsia-500/30 transition-all duration-500" />
                                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-10 rounded-[2rem] ring-1 ring-white/20 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                                    <div className="text-6xl mb-6 animate-bounce-slow">🏆</div>
                                    <p className="text-4xl font-bold capitalize mb-8 text-white tracking-tight">
                                        {new Date(stats.bestDay.date).toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric' })}
                                    </p>
                                    <div className="inline-flex items-center gap-3 bg-fuchsia-500/20 rounded-full px-8 py-3 ring-1 ring-fuchsia-400/30">
                                        <span className="text-4xl font-bold">{stats.bestDay.hours}</span>
                                        <span className="text-xl text-fuchsia-200 font-medium">horas</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentSlideType === "dayOfWeek" && stats.mostProductiveDayOfWeek && (
                        <div className="space-y-10">
                            <h2 className="text-xl font-medium text-amber-200 tracking-wide">DÍA FAVORITO</h2>
                            <div className="bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl p-10 rounded-[2rem] ring-1 ring-white/10 shadow-xl">
                                <div className="text-6xl mb-6">☀️</div>
                                <p className="text-xl font-medium text-white/80 mb-4">Brillas más los</p>
                                <h1 className="text-5xl font-bold capitalize text-amber-100 mb-6 tracking-tight">
                                    {stats.mostProductiveDayOfWeek}s
                                </h1>
                                <div className="bg-amber-500/10 rounded-xl p-4 ring-1 ring-amber-500/20">
                                    <p className="text-base font-medium text-amber-100/90">Es cuando tu energía está al máximo</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentSlideType === "comparison" && stats.previousMonth && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-medium text-violet-200 tracking-wide">COMPARACIÓN</h2>
                            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] ring-1 ring-white/10 shadow-2xl">
                                <p className="text-base text-white/60 mb-8 font-medium">Vs. mes anterior</p>
                                <div className="flex items-center justify-start gap-12 mb-10 px-4">
                                    <div className="text-left">
                                        <div className="text-xs font-bold uppercase text-white/40 mb-2">Anterior</div>
                                        <div className="text-3xl font-bold text-white/50">{stats.previousMonth.hours.toFixed(1)}</div>
                                    </div>
                                    <div className={`text-3xl ${isImprovement ? 'text-green-400' : 'text-orange-400'}`}>
                                        {isImprovement ? '↗' : '↘'}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold uppercase text-white/40 mb-2">Actual</div>
                                        <div className="text-4xl font-bold text-white">{stats.hours.toFixed(1)}</div>
                                    </div>
                                </div>
                                <div className={`inline-flex items-center gap-2 ${isImprovement ? 'bg-green-500/10 text-green-300 ring-green-500/30' : 'bg-orange-500/10 text-orange-300 ring-orange-500/30'} rounded-full px-6 py-2 ring-1`}>
                                    <span className="text-xl font-bold">
                                        {isImprovement ? '+' : ''}{hoursChange.toFixed(1)}h
                                    </span>
                                    <span className="text-sm font-medium">
                                        {isImprovement ? 'Progreso' : 'Diferencia'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentSlideType === "ministry" && (
                        <div className="space-y-10">
                            <h2 className="text-xl font-medium text-teal-200 tracking-wide">MINISTERIO</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {stats.placements > 0 && (
                                    <div className="bg-gradient-to-r from-teal-900/40 to-emerald-900/40 p-6 rounded-2xl backdrop-blur-md ring-1 ring-white/10 flex items-center justify-between shadow-lg">
                                        <div className="text-left">
                                            <span className="block text-4xl font-bold text-white mb-1">{stats.placements}</span>
                                            <span className="text-sm font-medium text-white/70">Publicaciones</span>
                                        </div>
                                        <div className="text-5xl opacity-80">📚</div>
                                    </div>
                                )}
                                {stats.videos > 0 && (
                                    <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 p-6 rounded-2xl backdrop-blur-md ring-1 ring-white/10 flex items-center justify-between shadow-lg">
                                        <div className="text-left">
                                            <span className="block text-4xl font-bold text-white mb-1">{stats.videos}</span>
                                            <span className="text-sm font-medium text-white/70">Videos</span>
                                        </div>
                                        <div className="text-5xl opacity-80">▶️</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentSlideType === "teaching" && (
                        <div className="space-y-10">
                            <h2 className="text-xl font-medium text-purple-200 tracking-wide">ENSEÑANZA</h2>
                            <div className="space-y-4">
                                {stats.returnVisits > 0 && (
                                    <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md ring-1 ring-white/10">
                                        <div className="flex items-baseline justify-start gap-2">
                                            <span className="text-6xl font-bold text-white tracking-tight">{stats.returnVisits}</span>
                                        </div>
                                        <span className="text-sm font-medium text-purple-200 uppercase tracking-widest mt-2 block">Revisitas</span>
                                    </div>
                                )}
                                {stats.bibleStudies > 0 && (
                                    <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md ring-1 ring-white/10">
                                        <div className="flex items-baseline justify-start gap-2">
                                            <span className="text-6xl font-bold text-white tracking-tight">{stats.bibleStudies}</span>
                                        </div>
                                        <span className="text-sm font-medium text-pink-200 uppercase tracking-widest mt-2 block">Cursos Bíblicos</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentSlideType === "ldc" && (
                        <div className="space-y-8">
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-xl" />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl ring-1 ring-orange-500/40">
                                    👷
                                </div>
                            </div>
                            <h2 className="text-xl font-medium text-orange-200 tracking-wide">CONSTRUCCIÓN (LDC)</h2>
                            <div className="bg-gradient-to-b from-orange-900/30 to-transparent p-10 rounded-[2rem] ring-1 ring-orange-500/20 shadow-xl">
                                <div className="text-7xl font-bold text-white tracking-tighter mb-2">
                                    {Math.floor(stats.ldcHours)}
                                    <span className="text-3xl text-orange-200/70 font-normal ml-1">h</span>
                                </div>
                                {stats.ldcHours % 1 !== 0 && (
                                    <div className="text-xl font-medium text-orange-200/80 mt-2">
                                        +{Math.round((stats.ldcHours % 1) * 60)} min
                                    </div>
                                )}
                            </div>
                            <p className="text-lg text-white/70 font-medium">Tu labor edifica 🧱</p>
                        </div>
                    )}

                    {currentSlideType === "events" && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-medium text-gray-200 tracking-wide mb-6">EVENTOS ESPECIALES</h2>
                            <div className="flex flex-col gap-3">
                                {[...new Set(stats.events)].map(evt => (
                                    <div key={evt} className="bg-white/5 p-4 rounded-xl flex items-center gap-4 backdrop-blur-md ring-1 ring-white/10 hover:bg-white/10 transition-colors">
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            {evt === 'circuit_assembly' && <HomeIcon className="w-6 h-6 text-indigo-300" />}
                                            {evt === 'regional_convention' && <BuildingOfficeIcon className="w-6 h-6 text-purple-300" />}
                                            {evt === 'cleaning' && <SparklesIcon className="w-6 h-6 text-teal-300" />}
                                            {evt === 'campaign' && <MegaphoneIcon className="w-6 h-6 text-orange-300" />}
                                            {evt === 'sick' && <MedicalIcon className="w-6 h-6 text-red-300" />}
                                        </div>

                                        <span className="text-lg font-medium capitalize flex-1 text-left text-white/90">
                                            {evt === 'circuit_assembly' && "Asamblea de Circuito"}
                                            {evt === 'regional_convention' && "Asamblea Regional"}
                                            {evt === 'cleaning' && "Limpieza del Salón"}
                                            {evt === 'campaign' && "Campaña Especial"}
                                            {evt === 'sick' && "Día de Enfermedad"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentSlideType === "outro" && (
                        <div className="space-y-12 h-screen flex flex-col justify-center pb-20">
                            <h1 className="text-6xl font-bold text-white tracking-tight leading-tight">
                                ¡Gran<br />Trabajo!
                            </h1>

                            <div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                                    className="px-8 py-3 rounded-full font-bold text-lg bg-white text-black shadow-lg hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Cerrar Resumen
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 pb-8 safe-area-bottom z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                        className={`transition-all duration-300 rounded-full ${index === currentSlide ? 'bg-white w-6 h-2' : 'bg-white/30 w-2 h-2 hover:bg-white/50'
                            }`}
                    />
                ))}
            </div>

            <style>{`
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-progress {
                    animation-name: progress;
                    animation-timing-function: linear;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .animate-bounce-slow {
                    animation: bounce 3s infinite;
                }
                .animate-float {
                    animation: float 20s infinite ease-in-out;
                }
                .animate-pulse-slow {
                    animation: pulse 4s infinite;
                }
                @keyframes fadeInUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.98); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    33% { transform: translate(20px, -20px); }
                    66% { transform: translate(-10px, 10px); }
                }
            `}</style>
        </div>
    );
};

export default MonthWrapped;
