"use strict";
// showing loading
function displayLoading() {
  // selecting loading div
  const loader = document.querySelector("#loading");
  loader.classList.add("display");
  // to stop loading after some time
  setTimeout(() => {
    loader.classList.remove("display");
  }, 5000);
}

// hiding loading
function hideLoading() {
  // selecting loading div
  const loader = document.querySelector("#loading");
  loader.classList.remove("display");
}

function addEventWebCam() {
  const webCamForm = document.getElementById("webCamForm");
  webCamForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const jsonResult = document.getElementById("webCamJsonResult");
    jsonResult.innerHTML = "";
    displayLoading();
    try {
      const res = await fetch("/api/webcam");
      if (!res.ok) {
        throw new Error(`Response status: ${res.status}`);
      }
      const data = await res.text();
      const html = data.replace("<img", '<img class="img-fluid mt-2"');
      jsonResult.innerHTML = html;
    } catch (error) {
      console.error(error.message);
    }
    hideLoading();
  });
}

function addEventBoiler() {
  const boilerForm = document.getElementById("boilerForm");
  boilerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/servo");
      if (!res.ok) {
        throw new Error(`Response status: ${res.status}`);
      }
      const data = await res.json();
      const html = JSON.stringify(data);
      document.getElementById("boilerJsonResult").innerText = html;
    } catch (error) {
      console.error(error.message);
    }
  });
}

function addEventSchedules(i, formId, dropdownId, jsonResultId) {
  const form = document.getElementById(formId);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const dropdown = document.getElementById(dropdownId);
      const schedule = dropdown.value;
      const res = await fetch("/api/schedules", {
        method: "post",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          schedule: schedule,
          index: i,
        }),
      });
      if (!res.ok) {
        throw new Error(`Response status: ${res.status}`);
      }
      const data = await res.json();
      const jsonResult = document.getElementById(jsonResultId);
      jsonResult.innerText = JSON.stringify(data);
    } catch (error) {
      console.error(error.message);
    }
  });
}

async function loadSchedules() {
  try {
    let res = await fetch("/api/schedules");
    let data = await res.json();
    const schedules = data.schedules;
    if (!schedules) return;

    res = await fetch("/api/schedules-options");
    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }
    data = await res.json();
    const schedulesOptions = data.schedulesOptions;
    if (!schedulesOptions) return;

    let uiItems = schedules.map((schedule, i) => {
      const di = i; // display id
      const formId = `schedule${di}Form`;
      const dropdownId = `schedule${di}`;
      const jsonResultId = `schedule${di}JsonResult`;
      return { di, formId, dropdownId, jsonResultId };
    });

    uiItems.forEach((uiItem, i) => {
      const { formId, dropdownId, jsonResultId } = uiItem;
      addEventSchedules(i, formId, dropdownId, jsonResultId);
    });
  } catch (error) {
    console.error(error.message);
  }
}

function sortTable(columnIndex, tableId) {
  let table = document.getElementById(tableId);
  let rows = Array.prototype.slice.call(table.querySelectorAll("tbody > tr"));

  const ths = table.querySelectorAll("thead > tr > th");
  let reverseFactor = 1; // asc = 1, dsc = -1
  if (ths[columnIndex].classList.contains("dsc")) {
    reverseFactor = -1;
  }
  ths[columnIndex].classList.toggle("dsc");

  rows.sort(function (rowA, rowB) {
    let cellA = rowA.cells[columnIndex].textContent;
    let cellB = rowB.cells[columnIndex].textContent;

    // Handle numerical values
    if (!isNaN(cellA) && !isNaN(cellB)) {
      return reverseFactor * (cellA - cellB);
    }

    // Default to string comparison
    return reverseFactor * cellA.localeCompare(cellB);
  });

  rows.forEach(function (row) {
    table.querySelector("tbody").appendChild(row);
  });
}

async function updateScheduleTable() {
  try {
    const res = await fetch("/api/schedule-rates");
    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }
    const data = await res.json();
    let dateRatesHtml = "";
    if (data.date) {
      const date = data.date;
      dateRatesHtml = `<h5>Schedule Rates: ${date}</h5>`;
    }
    if (data.scheduleRates) {
      const scheduleRates = data.scheduleRates;
      const scheduleRatesHtml = json2Table(scheduleRates);
      dateRatesHtml = `${dateRatesHtml}${scheduleRatesHtml}`;
    }
    const scheduleRatesTable = document.getElementById("scheduleRates");
    scheduleRatesTable.innerHTML = `${dateRatesHtml}`;
  } catch (error) {
    console.error(error.message);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // main action after document load
  addEventWebCam();
  addEventBoiler();
  await loadSchedules();
});
