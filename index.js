// Make an api request to get the data from this link https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employees

import fetch from 'node-fetch';

const employeesURL = 'https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employees';
const appointmentsURL = 'https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employee/${employeesId}/appointments. ';
const INTERVAL = 30; 

// Tools

// convert time to minutes
const convertTimeToMinutes = (time) => {
    const timeArray = time.split(':');
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

// get available times viewing all available appointments from the employees
const availableTime = (employees, appointments) => {
    employees = employees.employees;

    //seeing the available time for each employee
    const availableTimes = employees.map((employee, index) => {

        employee = employees[index];
        appointments = appointments[index].appointments;

        const startsAt = employee.startsAt;
        const finishesAt = employee.finishesAt;

        const availableTimes = [];

        // convert startsAt and finishesAt to minutes 
        const startsAtMinutes = convertTimeToMinutes(startsAt);
        const finishesAtMinutes = convertTimeToMinutes(finishesAt);

        //convert startsAt from appointment to minutes
        const startsAtAppointment = appointments.forEach(appointment => {
            const startsAtAppointmentMinutes = convertTimeToMinutes(appointment.startsAt);
            return startsAtAppointmentMinutes;
        });

        console.log(startsAtAppointment);

        // get the available time
        for (let i = startsAtMinutes; i < finishesAtMinutes; i += INTERVAL) {
            // see if the time i is equal to a value in the startsAtAppointmentMinutes, and if it is, add it to the availableTimes array
            for (let j = 0; j < startsAtAppointment.length; j++) {
                if (i !== startsAtAppointment[j]) {
                    availableTimes.push(convertMinutesToTime(i));
                }
            }
        }
    });
    //sort and remove duplicates on availableTimes
    availableTimes.sort((a, b) => a - b);
    availableTimes.filter((time, index, self) => self.indexOf(time) === index);
    return availableTimes;
}



// main function
const main = async () => {
    const employees = await getEmployeeData();
    const appointments = await getAppointments(employees);
    const teste = availableTime(employees, appointments);
    console.log(teste);
    // const availableTimes = await getAvailableTimes(appointments);
    // return availableTimes;
}

main();