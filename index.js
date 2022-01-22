// Make an api request to get the data from this link https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employees

import fetch from 'node-fetch';

const employeesURL = 'https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employees';
const appointmentsURL = 'https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employee/${employeesId}/appointments. ';


// IMUTABLE VARIABLES
const INTERVAL = 30;
const INITIAL_TIME = '08:00';
const FINAL_TIME = '18:00';

//                          Tools (Acho que seria necessário colocar em um arquivo separado)

// convert time to minutes
const convertTimeToMinutes = (time) => {
    const timeArray = time?.split(':');
    const hours = parseInt(timeArray[0]);
    const minutes = parseInt(timeArray[1]);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes;
}

// convert minutes to time
const convertMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    let minutesLeft = minutes % 60;
    if (minutesLeft == "0") minutesLeft = '00';
    const time = `${hours}:${minutesLeft}`;
    return time;
}

// fetch data from the api
const fetchData = async (url) => {
    const response = await fetch(url)
        .then(res => res.json())
        .then(data => data)
        .catch(err => console.log(err));
    return response;
}

// get employee data and return it as a list
const getEmployeeData = async () => {
    const employees = await fetchData(employeesURL);
    return employees;
}


// use the id to fetch the appointments
async function getAppointments(employees) {
    employees = employees.employees;
    const appointments = await Promise.all(employees.map(async (employee) => {
        const appointmentsURL = `https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employee/${employee.id}/appointments`;
        const appointment = await fetchData(appointmentsURL);
        return appointment;
    }));
    return appointments;
}


// create a list with all the possible time from the initial time to the final time with a half hour interval
const createTimeList = () => {
    const timeList = [];
    const initialTime = convertTimeToMinutes(INITIAL_TIME);
    const finalTime = convertTimeToMinutes(FINAL_TIME);
    const interval = INTERVAL;
    for (let i = initialTime; i <= finalTime; i += interval)timeList.push(i);
    return timeList;
}

// put all appointments into  a single list
const createAppointmentsList = (appointments) => {
    const appointmentsList = [];
    appointments.forEach(appointment => {
        appointment.appointments.forEach(appointment => {
            appointmentsList.push(appointment.startsAt);
        });
    });
    return appointmentsList;
}

// go through the appointments (with the time)  and set true in the variable available if the time is not in the appointments
const getAvailableTime = (employees, appointments) => {
    employees = employees.employees;

    const initialTimeArray = createTimeList();
    const appointmentsList = createAppointmentsList(appointments);

    const availableTimes = [];

    initialTimeArray.forEach(time => {
        // Count the number of times that the time is in the appointments list
        const timeAppointments = appointmentsList.filter(appointment => {
            return convertTimeToMinutes(appointment) === time;
        });
        // if the timeAppointments.lenght is equal than the number of the employees, 
        //it means that all employees are occupied at that time
        if (timeAppointments.length < employees.length) {
            time = convertMinutesToTime(time);
            availableTimes.push(time);
        }
    });
    return availableTimes;
}








// main function
const main = async () => {
    const employees = await getEmployeeData();
    const appointments = await getAppointments(employees);
    const availableTimes = getAvailableTime(employees, appointments);
    return availableTimes;
}

main();