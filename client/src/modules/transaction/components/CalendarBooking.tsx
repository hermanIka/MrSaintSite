import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  Globe,
  Loader2,
  CreditCard
} from "lucide-react";
import CalendlyWidget from "./CalendlyWidget";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface TimeSlot {
  time: string;
  schedulingUrl: string;
}

interface EventType {
  uri: string;
  name: string;
  slug: string;
  duration: number;
  schedulingUrl: string;
  description: string | null;
  color: string;
}

interface CalendarBookingProps {
  serviceType: string;
  serviceName: string;
  onSlotSelected?: (date: Date, time: string, schedulingUrl: string) => void;
}

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function getShortTimezone(tz: string): string {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('fr-FR', {
      timeZone: tz,
      timeZoneName: 'short',
    }).formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart?.value || tz;
  } catch {
    return tz;
  }
}

export default function CalendarBooking({
  serviceType,
  serviceName,
  onSlotSelected
}: CalendarBookingProps) {
  const { t } = useTranslation();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotUrl, setSelectedSlotUrl] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [selectedEventTypeUri, setSelectedEventTypeUri] = useState<string | null>(null);

  const userTimezone = useMemo(() => getUserTimezone(), []);
  const shortTz = useMemo(() => getShortTimezone(userTimezone), [userTimezone]);

  const { data: calendlyStatus } = useQuery<{ configured: boolean }>({
    queryKey: ['/api/calendly/status'],
  });

  const { data: eventTypesData, isLoading: loadingEventTypes } = useQuery<{ 
    success: boolean; 
    eventTypes: EventType[] 
  }>({
    queryKey: ['/api/calendly/event-types'],
    enabled: calendlyStatus?.configured === true,
  });

  const eventTypes = eventTypesData?.eventTypes || [];
  const eventType = selectedEventTypeUri 
    ? eventTypes.find(et => et.uri === selectedEventTypeUri) || eventTypes[0]
    : eventTypes[0];
  const eventTypeId = eventType?.uri?.split('/').pop();

  const dateRange = useMemo(() => {
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0);
    const now = new Date();
    if (start < now) {
      start.setTime(now.getTime());
    }
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    };
  }, [currentMonth, currentYear]);

  const availableTimesUrl = eventTypeId
    ? `/api/calendly/available-times/${eventTypeId}?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}&timezone=${encodeURIComponent(userTimezone)}`
    : null;

  const { data: availableTimesData, isLoading: loadingSlots } = useQuery<{
    success: boolean;
    availableTimes: Record<string, TimeSlot[]>;
    totalSlots: number;
    timezone: string;
  }>({
    queryKey: [availableTimesUrl],
    enabled: !!eventTypeId && !!availableTimesUrl,
    retry: 2,
    staleTime: 2 * 60 * 1000,
  });

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const hasAvailableSlots = (date: Date): boolean => {
    if (!availableTimesData?.availableTimes) return false;
    const dateKey = formatDateKey(date);
    const slots = availableTimesData.availableTimes[dateKey];
    return slots && slots.length > 0;
  };

  const isDateInFuture = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date >= todayStart;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    if (isDateInFuture(date)) {
      setSelectedDate(date);
      setSelectedTime(null);
      setSelectedSlotUrl(null);
    }
  };

  const handlePrevMonth = () => {
    const prevDate = new Date(currentYear, currentMonth - 1, 1);
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prevDate < todayMonth) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTime(slot.time);
    setSelectedSlotUrl(slot.schedulingUrl);
  };

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime && selectedSlotUrl) {
      if (onSlotSelected) {
        onSlotSelected(selectedDate, selectedTime, selectedSlotUrl);
      } else {
        setBookingConfirmed(true);
      }
    }
  };

  const handleEventTypeChange = (uri: string) => {
    setSelectedEventTypeUri(uri);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedSlotUrl(null);
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "";
    return `${DAYS_FR[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTHS_FR[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };

  const getSlotsForSelectedDate = (): TimeSlot[] => {
    if (!selectedDate || !availableTimesData?.availableTimes) return [];
    const dateKey = formatDateKey(selectedDate);
    return availableTimesData.availableTimes[dateKey] || [];
  };

  const canGoPrev = () => {
    const prevDate = new Date(currentYear, currentMonth - 1, 1);
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return prevDate >= todayMonth;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const hasSlots = hasAvailableSlots(date);
      const inFuture = isDateInFuture(date);
      const selected = isDateSelected(day);
      const isToday = 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear();
      
      const slotsForDay = hasSlots ? (availableTimesData?.availableTimes[formatDateKey(date)]?.length || 0) : 0;
      const isBusy = inFuture && !hasSlots;
      const hasLimitedSlots = hasSlots && slotsForDay > 0 && slotsForDay <= 3;

      days.push(
        <button
          key={day}
          data-testid={`calendar-day-${day}`}
          onClick={() => handleDateClick(day)}
          disabled={!inFuture}
          className={`
            h-10 w-10 rounded-md text-sm font-medium transition-colors relative
            ${selected 
              ? "bg-primary text-primary-foreground" 
              : hasSlots
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover-elevate cursor-pointer"
                : isBusy
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 cursor-pointer hover-elevate"
                  : "text-muted-foreground/50 cursor-not-allowed"
            }
            ${isToday && !selected ? "ring-2 ring-primary" : ""}
          `}
        >
          {day}
          {hasLimitedSlots && !selected && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {slotsForDay}
            </span>
          )}
        </button>
      );
    }

    return days;
  };

  if (!calendlyStatus?.configured) {
    return (
      <Card className="w-full max-w-2xl mx-auto" data-testid="card-calendly-not-configured">
        <CardContent className="p-8 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-heading font-bold mb-2">
            Calendrier non disponible
          </h2>
          <p className="text-muted-foreground">
            Le système de réservation est en cours de configuration.
            Veuillez nous contacter directement pour prendre rendez-vous.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingEventTypes) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement du calendrier...</p>
        </CardContent>
      </Card>
    );
  }

  if (bookingConfirmed) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card data-testid="card-booking-confirmed">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">
              Finalisez votre réservation
            </h2>
            <p className="text-muted-foreground mb-4">
              Remplissez vos informations ci-dessous pour confirmer votre créneau.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-4 inline-block text-left space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span className="font-medium">{formatSelectedDate()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{serviceName}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedSlotUrl && (
          <CalendlyWidget
            schedulingUrl={selectedSlotUrl}
            selectedDate={selectedDate || undefined}
            selectedTime={selectedTime || undefined}
            serviceName={serviceName}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {eventTypes.length > 1 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <label className="text-sm font-medium mb-2 block">Type de rendez-vous</label>
            <Select
              value={eventType?.uri || ""}
              onValueChange={handleEventTypeChange}
            >
              <SelectTrigger data-testid="select-event-type">
                <SelectValue placeholder={t("calendar.selectEventType")} />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((et) => (
                  <SelectItem key={et.uri} value={et.uri}>
                    {et.name} ({et.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card data-testid="card-calendar">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg font-heading">
                Choisir une date
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="w-3 h-3" />
                <span data-testid="text-timezone">{shortTz}</span>
              </div>
            </div>
            {eventType && (
              <p className="text-sm text-muted-foreground">
                {eventType.name} - {eventType.duration} min
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                disabled={!canGoPrev()}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-heading font-semibold">
                {MONTHS_FR[currentMonth]} {currentYear}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                data-testid="button-next-month"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_FR.map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
                <span>Libre</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700" />
                <span>Occupé</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-primary" />
                <span>Sélectionné</span>
              </div>
            </div>

            {loadingSlots && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Chargement des créneaux...</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-time-slots">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-heading">
              {selectedDate
                ? `Créneaux du ${formatSelectedDate()}`
                : t("calendar.selectDate")
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <>
                {getSlotsForSelectedDate().length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {getSlotsForSelectedDate().map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          onClick={() => handleTimeSelect(slot)}
                          className="justify-start gap-2"
                          data-testid={`button-slot-${slot.time.replace(":", "")}`}
                        >
                          <Clock className="w-4 h-4" />
                          {slot.time}
                        </Button>
                      ))}
                    </div>

                    {selectedTime && (
                      <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Récapitulatif</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Service:</span> {serviceName}</p>
                            <p><span className="text-muted-foreground">Date:</span> {formatSelectedDate()}</p>
                            <p><span className="text-muted-foreground">Heure:</span> {selectedTime}</p>
                            <p><span className="text-muted-foreground">Durée:</span> {eventType?.duration || 30} minutes</p>
                          </div>
                        </div>
                        <Button
                          className="w-full gap-2"
                          size="lg"
                          onClick={handleConfirmBooking}
                          data-testid="button-confirm-booking"
                        >
                          {onSlotSelected ? (
                            <>
                              <CreditCard className="w-4 h-4" />
                              {t("reservation.payNow")}
                            </>
                          ) : (
                            <>
                              <CalendarIcon className="w-4 h-4" />
                              {t("calendar.bookBtn")}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mb-3 opacity-50" />
                    <p>{t("calendar.noSlots")}</p>
                    <p className="text-sm mt-2">{t("calendar.noSlotsDesc")}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mb-3 opacity-50" />
                <p>{t("calendar.selectDate")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
