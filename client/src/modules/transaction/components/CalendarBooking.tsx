import { useState, useEffect } from "react";
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
  ExternalLink
} from "lucide-react";

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

export default function CalendarBooking({ 
  serviceType, 
  serviceName,
  onSlotSelected 
}: CalendarBookingProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotUrl, setSelectedSlotUrl] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

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

  const eventType = eventTypesData?.eventTypes?.[0];
  const eventTypeId = eventType?.uri?.split('/').pop();

  const { data: availableTimesData, isLoading: loadingSlots, isError: slotsError, refetch: refetchSlots } = useQuery<{
    success: boolean;
    availableTimes: Record<string, TimeSlot[]>;
    totalSlots: number;
  }>({
    queryKey: ['/api/calendly/available-times', eventTypeId],
    enabled: !!eventTypeId,
    retry: 2,
  });

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const hasAvailableSlots = (date: Date): boolean => {
    if (!availableTimesData?.availableTimes) return false;
    const dateKey = formatDateKey(date);
    const slots = availableTimesData.availableTimes[dateKey];
    return slots && slots.length > 0;
  };

  const isDateAvailable = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    if (date < today) return false;
    return hasAvailableSlots(date);
  };

  const isDateInFuture = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    return date >= today;
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
      window.open(selectedSlotUrl, '_blank');
      setBookingConfirmed(true);
      onSlotSelected?.(selectedDate, selectedTime, selectedSlotUrl);
    }
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
              : inFuture 
                ? "hover-elevate cursor-pointer" 
                : "text-muted-foreground/50 cursor-not-allowed"
            }
            ${isToday && !selected ? "ring-1 ring-primary" : ""}
          `}
        >
          {day}
          {hasSlots && !selected && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
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
      <Card className="w-full max-w-2xl mx-auto" data-testid="card-booking-confirmed">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">
            Réservation en cours !
          </h2>
          <p className="text-muted-foreground mb-6">
            Finalisez votre réservation sur Calendly dans la nouvelle fenêtre.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-2">
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
          {selectedSlotUrl && (
            <Button 
              variant="outline" 
              onClick={() => window.open(selectedSlotUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir Calendly
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <Card data-testid="card-calendar">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg font-heading">
                Choisir une date
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="w-3 h-3" />
                <span>Fuseau: Paris (GMT+1)</span>
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

            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-primary" />
                <span>Sélectionné</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-muted relative">
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
                </div>
                <span>Disponible</span>
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
                : "Sélectionnez une date"
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
                          <ExternalLink className="w-4 h-4" />
                          Réserver sur Calendly
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mb-3 opacity-50" />
                    <p>Aucun créneau disponible pour cette date</p>
                    <p className="text-sm mt-2">Essayez une autre date</p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mb-3 opacity-50" />
                <p>Veuillez d'abord sélectionner une date dans le calendrier</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
