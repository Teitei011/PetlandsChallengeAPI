// Make an api request to get the data from this link https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employees

import fetch from 'node-fetch';

const employeesURL = 'https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employees';
const appointmentsURL = 'https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employee/${employeesId}/appointments. ';
const INTERVAL = 30;

// Tools

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
    const minutesLeft = minutes % 60;
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


// go through the appointments (with the time)  and set true in the variable available if the time is not in the appointments
const getAvailableTime = (employees, appointments) => {
    employees = employees.employees;

    //Create a list of available times with all set to true
    const timeObject = [];

    for (let i = 8; i < 18; i++) {
        for (let j = 0; j < 60; j += 30) {

            const time = `${i}:${j}`;
            timeObject.push({ time: time, available: true });
        }
    }

    // put all appointments into  a single list
    const appointmentsList = [];
    appointments.forEach(appointment => {
        appointment.appointments.forEach(appointment => {
            appointmentsList.push(appointment.startsAt);
        });
    });

    // //count the number of repetition in the apointments list and return an object with the time and the number of repetition
    const appointmentsCount = appointmentsList.reduce((acc, curr) => {
        if (acc[curr]) acc[curr]++;
        else acc[curr] = 1;
        return acc;
    }, {});


    // create a array of object with the number of repetition in the appointments list
    const appointmentsCountArray = [];
    for (let key in appointmentsCount) {
        appointmentsCountArray.push({ time: key, count: appointmentsCount[key] });
    }

    console.log("Appointments count: ", appointmentsCountArray);

    // go through the appointmentsCountArray and set the available to false in the timeObject if the count is equal to the number of employees
    appointmentsCountArray.forEach(appointment => {
        timeObject.forEach(time => {
            if (time.time === appointment.time) {
                time.available = false;
            }
        });
    });
    


    console.log(timeObject);

}




// main function
const main = async () => {
    const employees = await getEmployeeData();
    const appointments = await getAppointments(employees);
    const availableTimes = getAvailableTime(employees, appointments);
    // const employeesAvailable = getNumberOfEmployeesAvailable(availableTimes);

    // console.log(availableTimes);
    return availableTimes;
}

main();