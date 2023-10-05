const fs = require('fs');
const XLSX = require('xlsx');

const file_path = 'Assignment_Timecard.xlsx';

const employeeData = {};

function consecutiveDays(dates) {
    dates.sort((a, b) => a - b);
    for (let i = 0; i < dates.length - 1; i++) {
        const currentDate = dates[i];
        const nextDate = dates[i + 1];
        const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
        if ((nextDate - currentDate) === oneDay) {
            return true;
        }
    }
    return false;
}

function lessThan10Hours(startTimes) {
    for (let i = 0; i < startTimes.length - 1; i++) {
        const currentTime = startTimes[i];
        const nextTime = startTimes[i + 1];
        const tenHours = 10 * 60 * 60 * 1000; // 10 hours in milliseconds
        if ((nextTime - currentTime) < tenHours) {
            return true;
        }
    }
    return false;
}

function moreThan14Hours(shiftHours) {
    for (const hours of shiftHours) {
        if (hours > 14 * 60 * 60 * 1000) { // 14 hours in milliseconds
            return true;
        }
    }
    return false;
}

const workbook = XLSX.readFile(file_path);
const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet

const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

sheetData.forEach((row) => {
    const positionId = row['Position ID'];
    const employeeName = row['Employee Name'];
    const timeIn = new Date(row['Time']);
    const timeOut = new Date(row['Time Out']);

    if (!employeeData[positionId]) {
        employeeData[positionId] = {
            name: employeeName,
            datesWorked: [],
            startTimes: [],
            shiftHours: [],
        };
    }

    employeeData[positionId].datesWorked.push(timeIn);
    employeeData[positionId].startTimes.push(timeIn);
    employeeData[positionId].shiftHours.push(timeOut - timeIn);
});

for (const [positionId, data] of Object.entries(employeeData)) {
    const { name, datesWorked, startTimes, shiftHours } = data;

    if (consecutiveDays(datesWorked)) {
        console.log(`Employee Name: ${name}, Position ID: ${positionId} worked for 7 consecutive days.`);
    }

    if (lessThan10Hours(startTimes)) {
        console.log(`Employee Name: ${name}, Position ID: ${positionId} had less than 10 hours between shifts.`);
    }

    if (moreThan14Hours(shiftHours)) {
        console.log(`Employee Name: ${name}, Position ID: ${positionId} worked for more than 14 hours in a single shift.`);
    }
}
