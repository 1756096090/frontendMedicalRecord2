import { useCallback, useEffect, useState } from 'react'
import './Schedule.css';
import { UserController } from '../../controllers/UserController';
import { Doctor } from '../../models/UserDoctor';
import { Patient } from '../../models/Patient';
import { PatientController } from '../../controllers/PatientController';

interface Event {
    Id: number;
    Date: Date;
    IdUser: string;
    IdPatient: string;
    StartAppointment: Date;
    EndAppointment: Date;
    StartOriginalDate: Date | null;
    Text: string;
}

export const Schedule = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthsOfYear = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentDate = new Date();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [eventStartTime, setEventStartTime] = useState({ hours: '00', minutes: '00' });
    const [eventEndTime, setEventEndTime] = useState({ hours: '00', minutes: '00' });
    const [eventIdPatient, setEventIdPatient] = useState("");
    const [eventIdDoctor, setEventIdDoctor] = useState("");
    const [eventText, setEventText] = useState('');
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const [userController] = useState(new UserController());
    const [patientController] = useState(new PatientController());

    const loadDoctors = useCallback(async () => {
        try {
            const fetchDoctors = await userController.getDoctors();
            setDoctors(fetchDoctors);
        } catch (error) {
            console.error("Failed to load doctors", error);
        }
    }, [userController]);

    const loadPatients = useCallback(async () => {
        try {
            const fetchPatients = await patientController.getPatients();
            setPatients(fetchPatients);
        } catch (error) {
            console.error("Failed to load patients", error);
        }
    }, [patientController]);

    useEffect(() => {
        loadDoctors();
        loadPatients();
    }, [loadDoctors, loadPatients]);

    const prevMonth = () => {
        setCurrentMonth(prevMonth => prevMonth === 0 ? 11 : prevMonth - 1);
        setCurrentYear(prevYear => currentMonth === 0 ? prevYear - 1 : prevYear);
    };

    const nextMonth = () => {
        setCurrentMonth(prevMonth => prevMonth === 11 ? 0 : prevMonth + 1);
        setCurrentYear(prevYear => currentMonth === 11 ? prevYear + 1 : prevYear);
    };

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(currentYear, currentMonth, day);
        const today = new Date();

        if (clickedDate >= today || isSameDay(clickedDate, today)) {
            setSelectedDate(clickedDate);
            setShowEventPopup(true);
            setEventText("");
            setEventStartTime({ hours: '00', minutes: '00' });
            setEventEndTime({ hours: '00', minutes: '00' });
            setEditingEvent(null);

            if (doctors.length > 0 && !eventIdDoctor) {
                setEventIdDoctor(doctors[0].ID);
            }
            if (patients.length > 0 && !eventIdPatient) {
                setEventIdPatient(patients[0].ID);
            }
        }
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const createDateFromTimeInputs = (date: Date, time: { hours: string, minutes: string }): Date => {
        const newDate = new Date(date);
        newDate.setHours(parseInt(time.hours));
        newDate.setMinutes(parseInt(time.minutes));
        return newDate;
    };

    const handleEventSubmit = () => {
        const startAppointment = createDateFromTimeInputs(selectedDate, eventStartTime);
        const endAppointment = createDateFromTimeInputs(selectedDate, eventEndTime);

        if (startAppointment >= endAppointment) {
            alert("End time must be after start time");
            return;
        }

        const newEvent: Event = {
            Id: editingEvent ? editingEvent.Id : Date.now(),
            Date: selectedDate,
            IdUser: eventIdDoctor,
            IdPatient: eventIdPatient,
            StartAppointment: startAppointment,
            EndAppointment: endAppointment,
            StartOriginalDate: editingEvent?.StartAppointment || null,
            Text: eventText,
        };

        setEvents(prevEvents => {
            const updatedEvents = editingEvent
                ? prevEvents.map(event => event.Id === editingEvent.Id ? newEvent : event)
                : [...prevEvents, newEvent];

            return updatedEvents.sort((a, b) =>
                a.StartAppointment.getTime() - b.StartAppointment.getTime()
            );
        });

        setEditingEvent(null);
        setEventStartTime({ hours: '00', minutes: '00' });
        setEventEndTime({ hours: '00', minutes: '00' });
        setEventText("");
        setShowEventPopup(false);
    };

    const handleEditEvent = (event: Event) => {
        setSelectedDate(event.Date);
        setEventStartTime({
            hours: event.StartAppointment.getHours().toString().padStart(2, '0'),
            minutes: event.StartAppointment.getMinutes().toString().padStart(2, '0')
        });
        setEventEndTime({
            hours: event.EndAppointment.getHours().toString().padStart(2, '0'),
            minutes: event.EndAppointment.getMinutes().toString().padStart(2, '0')
        });
        setEventIdDoctor(event.IdUser);
        setEventIdPatient(event.IdPatient);
        setEventText(event.Text);
        setEditingEvent(event);
        setShowEventPopup(true);
    };

    const handleDeleteEvent = (event: Event) => {
        setEvents(prevEvents => prevEvents.filter(e => e.Id !== event.Id));
    };

    const handleTimeChange = (timeType: 'start' | 'end', field: 'hours' | 'minutes', value: string) => {
        const setterFunction = timeType === 'start' ? setEventStartTime : setEventEndTime;
        const numValue = parseInt(value) || 0;
        const maxValue = field === 'hours' ? 23 : 59;

        setterFunction(prev => ({
            ...prev,
            [field]: Math.min(Math.max(0, numValue), maxValue).toString().padStart(2, '0')
        }));
    };

    return (
        <div className='container'>
            <div className='calendar-app'>
                <div className='calendar'>
                    <h1 className='heading'>Calendar</h1>
                    <div className="navigate-date">
                        <h2 className="month">{monthsOfYear[currentMonth]}</h2>
                        <h2 className="year">{currentYear}</h2>
                        <div className="buttons">
                            <i className="bx bx-chevron-left" onClick={prevMonth}></i>
                            <i className="bx bx-chevron-right" onClick={nextMonth}></i>
                        </div>
                    </div>
                    <div className="weekdays">
                        {daysOfWeek.map(day => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>
                    <div className="days">
                        {[...Array(firstDayOfMonth)].map((_, index) => (
                            <span key={`empty-${index}`}></span>
                        ))}
                        {[...Array(daysInMonth)].map((_, index) => {
                            const day = index + 1;
                            return (
                                <span
                                    key={day}
                                    className={
                                        day === currentDate.getDate() &&
                                            currentMonth === currentDate.getMonth() &&
                                            currentYear === currentDate.getFullYear()
                                            ? 'current-day'
                                            : ''
                                    }
                                    onClick={() => handleDayClick(day)}
                                >
                                    {day}
                                </span>
                            );
                        })}
                    </div>
                </div>
                <div className="events">
                    {showEventPopup && (
                        <div className="event-popup">
                            <div className="time-input">
                                <div className="event-popup-time">Start Time</div>
                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    className='hours'
                                    value={eventStartTime.hours}
                                    onChange={e => handleTimeChange('start', 'hours', e.target.value)}
                                />
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    className='minutes'
                                    value={eventStartTime.minutes}
                                    onChange={e => handleTimeChange('start', 'minutes', e.target.value)}
                                />
                            </div>
                            <div className="time-input">
                                <div className="event-popup-time">End Time</div>
                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    className='hours'
                                    value={eventEndTime.hours}
                                    onChange={e => handleTimeChange('end', 'hours', e.target.value)}
                                />
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    className='minutes'
                                    value={eventEndTime.minutes}
                                    onChange={e => handleTimeChange('end', 'minutes', e.target.value)}
                                />
                            </div>
                            <div className="event-select">
                                <div className="event-popup-doctor">
                                    <select
                                        value={eventIdDoctor}
                                        onChange={e => setEventIdDoctor(e.target.value)}
                                        className="border rounded p-2 w-full"
                                    >
                                        {doctors.map(doctor => (
                                            <option key={doctor.ID} value={doctor.ID}>
                                                {doctor.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="event-popup-patient">
                                    <select
                                        value={eventIdPatient}
                                        onChange={e => setEventIdPatient(e.target.value)}
                                        className="border rounded p-2 w-full"
                                    >
                                        {patients.map(patient => (
                                            <option key={patient.ID} value={patient.ID}>
                                                {patient.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <textarea
                                placeholder='Enter Event Text (Maximum 60 Characters)'
                                value={eventText}
                                onChange={e => {
                                    if (e.target.value.length <= 60) {
                                        setEventText(e.target.value);
                                    }
                                }}
                            />
                            <button className="event-popup-btn" onClick={handleEventSubmit}>
                                {editingEvent ? "Update Event" : "Add Event"}
                            </button>
                            <button className="close-event-popup" onClick={() => setShowEventPopup(false)}>
                                <i className="bx bx-x"></i>
                            </button>
                        </div>
                    )}
                    {events.map((event: Event) => (
                        <div className="event" key={event.Id}>
                            <div className="event-date-wrapper">
                                <div className="event-date">
                                    {`${monthsOfYear[event.StartAppointment.getMonth()]} 
                                      ${event.StartAppointment.getDate()}, 
                                      ${event.StartAppointment.getFullYear()}`}
                                </div>
                                <div className="event-time">
                                    {`${event.StartAppointment.getHours().toString().padStart(2, '0')}:${event.StartAppointment.getMinutes().toString().padStart(2, '0')} - 
                                      ${event.EndAppointment.getHours().toString().padStart(2, '0')}:${event.EndAppointment.getMinutes().toString().padStart(2, '0')}`}
                                </div>
                                {event.StartOriginalDate && (
                                    <div className='event-reschedule'>
                                        Rescheduled from: {`${monthsOfYear[event.StartOriginalDate.getMonth()]} 
                                      ${event.StartOriginalDate.getDate()}, 
                                      ${event.StartOriginalDate.getFullYear()}`}
                                    </div>
                                )}
                            </div>
                            <div className="event-text">{event.Text}</div>
                            <div className="event-buttons">
                                <i className="bx bxs-edit-alt" onClick={() => handleEditEvent(event)}></i>
                                <i className="bx bxs-message-alt-x" onClick={() => handleDeleteEvent(event)}></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};