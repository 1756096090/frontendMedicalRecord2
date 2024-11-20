import { useCallback, useEffect, useState } from 'react'
import './Schedule.css';
import { UserController } from '../../controllers/UserController';
import { Doctor } from '../../models/UserDoctor';
import { Patient } from '../../models/Patient';
import { PatientController } from '../../controllers/PatientController';
import { fetchPatients } from '../../services/Patient';

interface Event {
    Id: number;
    Date: Date;
    IdUser: string;
    IdPatient: string;
    StartAppointment: Date;
    EndAppointment: Date;
    StartOriginalDate: Date;
    Text: string;
}

export const Schedule = () => {

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const monthsOfYear = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]
    const currentDate = new Date();
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth())
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [eventTime, setEventTime] = useState({ hours: '00', minutes: '00' });
    const [eventIdPatient, setEventPatient] = useState("");
    const [eventIdDoctor, setEventDoctor] = useState("");
    const [eventStartAppointment, setEventStartAppointment] = useState<Date |null>(null);
    const [eventEndAppointment, setEventEndAppointment] = useState<Date |null>(null);
    const [eventText, setEventText] = useState('')
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    //services
    const [userController] = useState(new UserController());
    const [patientController] = useState(new PatientController());

    const loadDoctors = useCallback(async () => {
        try {
            const fetchDoctors = await userController.getDoctors();
            console.log(fetchDoctors);
            setDoctors(fetchDoctors);
        } catch (error) {
            console.error("Failed to load doctors", error);
        }
    }, [userController])

    const loadPatients = useCallback(async () => {
        try {
            const fetchPatients = await patientController.getPatients();
            console.log(fetchPatients);
            setPatients(fetchPatients);
        } catch (error) {
            console.error("Failed to load doctors", error);
        }
    }, [patientController])

    useEffect(() => {
        loadDoctors();
        loadPatients();
    }, [loadDoctors, loadPatients])

    const prevMonth = () => {
        setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
        setCurrentYear(prevYear => (currentMonth === 0 ? prevYear - 1 : prevYear));
    }

    const nextMonth = () => {
        setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
        setCurrentYear(prevYear => (currentMonth === 11 ? prevYear + 1 : prevYear));
    }

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(currentYear, currentMonth, day)
        const today = new Date()

        if (clickedDate >= today || isSameDay(clickedDate, today)) {
            setSelectedDate(clickedDate);
            setShowEventPopup(true);
            setEventText("");
            setEventTime({ hours: '00', minutes: '00' });
            setEditingEvent(null);

        }
    }

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        )
    }

    const handleEventSubmit = () => {
        const newEvent = {
            Id: editingEvent ? editingEvent.Id : Date.now(),
            Date: Date,
            IdUser: eventIdDoctor,
            IdPatient: eventIdPatient,
            StartAppointment: Date,
            EndAppointment: Date,
            StartOriginalDate: null,
            Text: eventText,
        }

        let updatedEvents = [...events]
        if (editingEvent) {
            updatedEvents = updatedEvents.map(event => event.Id === editingEvent.Id ? newEvent : event)
            setEditingEvent(null);
        } else {
            updatedEvents.push(newEvent)
        }

        updatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


        setEvents(updatedEvents);
        setEventTime({ hours: '00', minutes: '00' });
        setEventText("");
        setShowEventPopup(false)
    }

    const handleEditEvent = (event: Event) => {
        setSelectedDate(new Date(event.date));
        setEventTime(
            {
                hours: event.time.split(':')[0],
                minutes: event.time.split(':')[1]
            }
        )
        setEventText(event.Text);
        setEditingEvent(event);
        setShowEventPopup(true);

    }

    const handleDeleteEvent = (event: Event) => {
        const updatedEvents = events.filter(e => e.Id !== event.Id);
        setEvents(updatedEvents);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTimeChange = (e: any) => {
        const { name, value } = e.target;
        setEventTime((prevTime) => ({
            ...prevTime,
            [name]: value.padStart(2, '0')
        }));
    };

    const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEventDoctor(e.target.value);
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
                        {daysOfWeek.map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>
                    <div className="days">
                        {
                            [...Array(firstDayOfMonth).keys()].map((_, index) => {
                                return <span key={`empty-${index}`}></span>;
                            })
                        }
                        {
                            [...Array(daysInMonth).keys()].map((day) => {
                                return <span key={day + 1}
                                    className={day + 1 === currentDate.getDate() && currentMonth === currentDate.getMonth()
                                        && currentYear === currentDate.getFullYear()
                                        ? 'current-day'
                                        : ''
                                    }
                                    onClick={() => handleDayClick(day + 1)}

                                >{day + 1}</span>
                            }
                            )
                        }
                    </div>
                </div>
                <div className="events">

                    {showEventPopup && (
                        <div className="event-popup">
                            <div className="time-input">
                                <div className="event-popup-time">Start Time</div>
                                <input type="number" name='hours' min={0} max={24} className='hours'
                                    value={eventStartAppointment?.getHours()} onChange={handleTimeChange} />

                                <input type="number" name='minutes' min={0} max={60} className='minutes'
                                    value={eventStartAppointment?.getMinutes()} onChange={handleTimeChange}
                                />


                            </div>
                            <div className="time-input">
                                <div className="event-popup-time">End Time</div>
                                <input type="number" name='hours' min={0} max={24} className='hours'
                                    value={eventEndAppointment?.getHours()} onChange={handleTimeChange} />

                                <input type="number" name='minutes' min={0} max={60} className='minutes'
                                    value={eventEndAppointment?.getHours()} onChange={handleTimeChange}
                                />


                            </div>
                            <div className="event-select">
                                <div className="event-popup-doctor">
                                    <select
                                        name="doctorID"
                                        value={eventIdDoctor}
                                        onChange={handleDoctorChange}
                                        className="border rounded p-2 w-full"

                                    >
                                        {doctors.map((doctor) => (
                                            <option key={doctor.ID} value={doctor.ID}>
                                                {doctor.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="event-popup-patient">
                                    <select
                                        name="SpecialistID"
                                        value={eventIdDoctor}
                                        onChange={handleDoctorChange}
                                        className="border rounded p-2 w-full"
                                    >
                                        {patients.map((patient) => (
                                            <option key={patient.ID} value={patient.ID}>
                                                {patient.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>


                            <textarea placeholder='Enter Event Text (Maximun 60 Characters)'
                                value={eventText}
                                onChange={(e) => {
                                    if (e.target.value.length <= 60) {
                                        setEventText(e.target.value);
                                    }
                                }}></textarea>
                            <button className="event-popup-btn" onClick={handleEventSubmit}>
                                {editingEvent ? "Update Event" : "Add Event"}
                            </button>
                            <button className="close-event-popup" onClick={() => setShowEventPopup(false)}>
                                <i className="bx bx-x"></i>
                            </button>
                        </div>)}
                    {events.map((_event: Event, index: number) => (
                        <div className="event" key={index}>
                            <div className="event-date-wrapper">
                                <div className="event-date">{`
                                ${monthsOfYear[_event.date.getMonth()]} 
                                ${_event.date.getDate()} 
                                ${_event.date.getFullYear()}`}</div>

                                <div className="event-time">{_event.time}</div>
                            </div>
                            <div className="event-text">{_event.Text}</div>
                            <div className="event-buttons">
                                <i className="bx bxs-edit-alt" onClick={() => handleEditEvent(_event)}></i>
                                <i className="bx bxs-message-alt-x" onClick={() => handleDeleteEvent(_event)}></i>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>

    )
}

