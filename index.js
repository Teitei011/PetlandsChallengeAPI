// Make an api request to get the data from this link https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employees

import fetch from 'node-fetch';

const employeesURL = 'https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employees';
const appointmentsURL = 'https://api-homolog.geracaopet.com.br/api/challenges/challenge1/employee/${employeesId}/appointments. ';
const INTERVAL = 30; // PUT AT The BEGGINING OF THE FILE


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

// get available time from the id from the appointments
const availableTimeFromEmployees = (employees, appointments) => {
    const availableTimes = employees.map((employee, index) => {

        employee = employees.employees[index];

        const startsAt = employee.startsAt;
        const finishesAt = employee.finishesAt;

        const availableTimes = [];
        appointments = appointments[index].appointments;

        for (let i = startsAt; i < finishesAt; i += INTERVAL) {
            if(!appointments.find(appointments => appointments.startsAt === i)) {
                availableTimes.push(i);
            }

        }
    });
    return availableTimes;
}



// main function
const main = async () => {
    const employees = await getEmployeeData();
    const appointments = await getAppointments(employees);
    const teste = availableTimeFromEmployees(employees, appointments);
    console.log(teste);
    // const availableTimes = await getAvailableTimes(appointments);
    // return availableTimes;
}

main();