import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { eventsApi } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         isSameDay, isSameMonth, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TERRITORY_DOT = {
  Brazil: '#639922', Mexico: '#BA7517', NOLA: '#185FA5', SOLA: '#534AB7',
};

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());

  const { data } = useQuery({
    queryKey: ['events', { status: 'approved', all: true }],
    queryFn: () => eventsApi.list({ status: 'approved', limit: 200 }).then(r => r.data.data || []),
    staleTime: 60_000,
  });

  const events = (data || []).filter(e => e.event_date);
  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const startDay = (getDay(startOfMonth(current)) + 6) % 7;
  const paddingDays = Array(startDay).fill(null);
  const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  function eventsOnDay(day) {
    return events.filter(e => isSameDay(new Date(e.event_date + 'T12:00:00'), day));
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Calendário de Eventos</h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Eventos aprovados na Base Oficial</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setCurrent(subMonths(current, 1))} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex' }}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: 15, fontWeight: 500, minWidth: 160, textAlign: 'center' }}>{format(current, 'MMMM yyyy', { locale: ptBR })}</span>
          <button onClick={() => setCurrent(addMonths(current, 1))} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex' }}><ChevronRight size={16} /></button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {Object.entries(TERRITORY_DOT).map(([t, color]) => (
          <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />{t}
          </span>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #eee' }}>
          {WEEKDAYS.map(d => (
            <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 12, fontWeight: 500, color: '#888' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} style={{ minHeight: 80, borderRight: '1px solid #eee', borderBottom: '1px solid #eee', background: '#f9f9f9' }} />
          ))}
          {days.map((day, idx) => {
            const dayEvents = eventsOnDay(day);
            const isToday = isSameDay(day, new Date());
            const col = (paddingDays.length + idx) % 7;
            return (
              <div key={day.toISOString()} style={{ minHeight: 80, borderRight: col < 6 ? '1px solid #eee' : 'none', borderBottom: '1px solid #eee', padding: '6px 8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', fontSize: 12, fontWeight: isToday ? 500 : 400, background: isToday ? '#E6F1FB' : 'transparent', color: isToday ? '#185FA5' : '#888', marginBottom: 4 }}>
                  {format(day, 'd')}
                </span>
                {dayEvents.slice(0, 3).map((ev) => (
                  <Link key={ev.id} to={`/events/${ev.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2, padding: '2px 5px', borderRadius: 4, background: '#f5f5f5' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: TERRITORY_DOT[ev.territory] || '#888' }} />
                      <span style={{ fontSize: 11, color: '#222', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ev.name}</span>
                    </div>
                  </Link>
                ))}
                {dayEvents.length > 3 && <p style={{ margin: 0, fontSize: 10, color: '#888' }}>+{dayEvents.length - 3} mais</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
