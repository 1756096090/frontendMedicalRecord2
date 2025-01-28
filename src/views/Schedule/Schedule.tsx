import { useCallback, useEffect, useState } from 'react'
import './Schedule.css';
import { UserController } from '../../controllers/UserController';
import { Doctor } from '../../models/UserDoctor';
import { Patient } from '../../models/Patient';
import { Schedule } from '../../models/Schedule';
import { PatientController } from '../../controllers/PatientController';
import { ScheduleController } from '../../controllers/ScheduleController';




export const ScheduleView = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthsOfYear = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentDate = new Date();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [dateEdit, setDateEdit] = useState<Date | null>(null)
    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [events, setEvents] = useState<Schedule[]>([]);
    const [eventStartTime, setEventStartTime] = useState({ hours: '00', minutes: '00' });
    const [eventEndTime, setEventEndTime] = useState({ hours: '00', minutes: '00' });
    const [eventIdPatient, setEventIdPatient] = useState("");
    const [eventIdDoctor, setEventIdDoctor] = useState("");
    const [eventText, setEventText] = useState('');
    const [editingEvent, setEditingEvent] = useState<Schedule | null>(null);

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const [userController] = useState(new UserController());
    const [patientController] = useState(new PatientController());
    const [scheduleController] = useState(new ScheduleController());

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

    const loadEvents = useCallback(async () => {
        try {
            const fetchEvents = await scheduleController.getShedulesByMonthYear(currentMonth + 1, currentYear)
            console.log("🚀 ~ loadEvents ~ fetchEvents:", fetchEvents)
            setEvents(fetchEvents);
        } catch (error) {
            console.error("Failed to load events", error);
        }
    }, [currentMonth, currentYear, scheduleController])

    useEffect(() => {
        loadDoctors();
    }, [loadDoctors]);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    useEffect(() => {
        loadEvents();
    }, [currentMonth, currentYear, loadEvents]);


    const prevMonth = () => {
        setCurrentMonth(prevMonth => prevMonth === 0 ? 11 : prevMonth - 1);
        setCurrentYear(prevYear => currentMonth === 0 ? prevYear - 1 : prevYear);
    };

    const nextMonth = () => {
        console.log('enter next month');
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

        try {
            let startAppointment
        let endAppointment
        if(editingEvent && dateEdit){

                startAppointment = createDateFromTimeInputs(dateEdit, eventStartTime);
                endAppointment = createDateFromTimeInputs(dateEdit, eventEndTime);
            
        }else{
            startAppointment = createDateFromTimeInputs(selectedDate, eventStartTime);
            endAppointment = createDateFromTimeInputs(selectedDate, eventEndTime);
        }



        if (startAppointment >= endAppointment) {
            alert("End time must be after start time");
            return;
        }

        const newEvent: Schedule = {
            ID: editingEvent ? editingEvent.ID : (Date.now()).toString(),
            Date: selectedDate,
            IDUser: eventIdDoctor,
            IDPatient: eventIdPatient,
            StartAppointment: startAppointment,
            EndAppointment: endAppointment,
            StartOriginal: editingEvent?.StartAppointment || null,
            Text: eventText,
        };
        try {
            if (editingEvent) {
                scheduleController.editSchedule(newEvent);
            } else {
                scheduleController.addSchedule(newEvent);
            }
        }
        catch (error) {
            console.error("Failed to save event", error);
        }


        setEvents(prevEvents => {
            const updatedEvents = editingEvent
                ? prevEvents.map(event => event.ID === editingEvent.ID ? newEvent : event)
                : [...prevEvents, newEvent];

            return updatedEvents.sort((a, b) => {
                const dateA = new Date(a.StartAppointment);
                const dateB = new Date(b.StartAppointment);
                return dateA.getTime() - dateB.getTime();
            });
        });

        setEditingEvent(null);
        setEventStartTime({ hours: '00', minutes: '00' });
        setEventEndTime({ hours: '00', minutes: '00' });
        setEventText("");
        setShowEventPopup(false);

        }catch (error) {
            console.error("Failed to edit event", error);
        }
        
    };

    const handleEditEvent = (event: Schedule) => {
        const startAppointment =
            typeof event.StartAppointment === "string"
                ? new Date(event.StartAppointment)
                : event.StartAppointment;

        setSelectedDate(startAppointment);
        setDateEdit(startAppointment);
        setEventStartTime({
            hours: new Date(event.StartAppointment).getHours().toString().padStart(2, '0'),
            minutes: new Date(event.StartAppointment).getMinutes().toString().padStart(2, '0')
        });
        setEventEndTime({
            hours: new Date(event.EndAppointment).getHours().toString().padStart(2, '0'),
            minutes: new Date(event.EndAppointment).getMinutes().toString().padStart(2, '0')
        });
        setEventIdDoctor(event.IDUser);
        setEventIdPatient(event.IDPatient);
        setEventText(event.Text);
        setEditingEvent(event);
        setShowEventPopup(true);
    };

    const handleDeleteEvent = (event: Schedule) => {
        if (!window.confirm("Are you sure you want to delete this event?")) {
            return;
        }
        if (event.ID) {
            scheduleController.removeSchedule(event.ID)
        }
        setEvents(prevEvents => prevEvents.filter(e => e.ID !== event.ID));
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

    const handleDaysEdit = (type: "day" | "month" | "year", value: string) => {
        const numValue = parseInt(value);

        if (isNaN(numValue)) return;

        setDateEdit((prevDate: Date | null) => {
            const currentDate = prevDate ?? new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const day = currentDate.getDate();

            switch (type) {
                case "day":
                    return new Date(year, month, numValue);
                case "month": {
                    // Ensure the new day is valid for the new month
                    const lastDayOfNewMonth = new Date(year, numValue + 1, 0).getDate();
                    const newDay = Math.min(day, lastDayOfNewMonth);
                    return new Date(year, numValue, newDay);
                }
                case "year":
                    return new Date(numValue, month, day);
                default:
                    return currentDate;
            }
        });
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
                                {
                                    editingEvent &&
                                    <div>
                                        <input
                                            type="number"
                                            min={1}
                                            max={31}
                                            className="day-input"
                                            value={dateEdit ? dateEdit?.getDate() : ""}
                                            onChange={(e) => handleDaysEdit("day", e.target.value)}
                                        />

                                        <input
                                            type="number"
                                            min={0}
                                            max={11}
                                            className="month-input"
                                            value={dateEdit ? dateEdit?.getMonth()+1 : ""}
                                            onChange={(e) => handleDaysEdit("month", e.target.value)}
                                        />

                                        <input
                                            type="number"
                                            min={0}
                                            className="year-input"
                                            value={dateEdit ? dateEdit?.getFullYear() : ""}
                                            onChange={(e) => handleDaysEdit("year", e.target.value)}
                                        />
                                    </div>


                                }
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
                    {events && events.map((event: Schedule) => (
                        <div className="event" key={event.ID}>
                            <div className="event-date-wrapper">
                                <div className="event-date">
                                    {`${monthsOfYear[new Date(event.StartAppointment).getMonth()]} 
                                      ${new Date(event.StartAppointment).getDate()}, 
                                      ${new Date(event.StartAppointment).getFullYear()}`}
                                </div>
                                <div className="event-time">
                                    {`${new Date(event.StartAppointment).getHours().toString().padStart(2, '0')}:${new Date(event.StartAppointment).getMinutes().toString().padStart(2, '0')} - 
                                      ${new Date(event.EndAppointment).getHours().toString().padStart(2, '0')}:${new Date(event.EndAppointment).getMinutes().toString().padStart(2, '0')}`}
                                </div>
                                {event.StartOriginal && (
                                    <div className='event-reschedule'>
                                        Rescheduled from: {`${monthsOfYear[new Date(event.StartOriginal).getMonth()]} 
                                      ${new Date(event.StartOriginal).getDate()}, 
                                      ${new Date(event.StartOriginal).getFullYear()}`}
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