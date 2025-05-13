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

async function handlePressBoiler(jsonResultId) {
  try {
    const res = await fetch("/api/servo");
    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }
    const data = await res.json();
    const html = JSON.stringify(data);
    document.getElementById(jsonResultId).innerText = html;
  } catch (error) {
    console.error(error.message);
  }
}

async function handleSubmitSchedule(i, dropdownId, jsonResultId) {
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

document.addEventListener("DOMContentLoaded", async () => {
  // main action after document load
  addEventWebCam();
});
