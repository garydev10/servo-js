'use strict'
// showing loading
function displayLoading() {
    // selecting loading div
    const loader = document.querySelector('#loading');
    loader.classList.add('display');
    // to stop loading after some time
    setTimeout(() => {
        loader.classList.remove('display');
    }, 5000);
}

// hiding loading
function hideLoading() {
    // selecting loading div
    const loader = document.querySelector('#loading');
    loader.classList.remove('display');
}

function addEventWebCam() {
    const webCamForm = document.getElementById('webCamForm');
    webCamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const jsonResult = document.getElementById('webCamJsonResult');
        jsonResult.innerHTML = '';
        displayLoading();
        try {
            const res = await fetch('/api/webcam');
            if (!res.ok) {
                throw new Error(`Response status: ${res.status}`);
            }
            const data = await res.text();
            const html = data.replace('<img', '<img class="img-fluid mt-2"');
            jsonResult.innerHTML = html;
        } catch (error) {
            console.error(error.message);
        }
        hideLoading();
    });
}

function addEventBoiler() {
    const boilerForm = document.getElementById('boilerForm');
    boilerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/servo');
            if (!res.ok) {
                throw new Error(`Response status: ${res.status}`);
            }
            const data = await res.json();
            const html = JSON.stringify(data);
            document.getElementById('boilerJsonResult').innerText = html;
        } catch (error) {
            console.error(error.message);
        }
    });
}

function addEventSchedules(i, formId, dropdownId, jsonResultId) {
    const form = document.getElementById(formId);
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const dropdown = document.getElementById(dropdownId);
            const schedule = dropdown.value;
            const res = await fetch('/api/schedules', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({
                    schedule: schedule,
                    index: i,
                })
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
    let dropdownIds = [];
    try {
        let res = await fetch('/api/schedules');
        let data = await res.json();
        const schedules = data.schedules;
        if (!schedules) return;

        res = await fetch('/api/schedules-options');
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

        // init form
        const formsHtml = schedules.map((schedule, i) => {
            const { di, formId, dropdownId, jsonResultId } = uiItems[i];
            const formHtml = `
                <form id="${formId}" class="row">
                    <label for="${dropdownId}" class="form-label">Schedule ${di} Boiler switch at: </label>
                    <div class="col-sm-4">
                        <select name="${dropdownId}" id="${dropdownId}" class="form-select">
                            ${schedulesOptions.map((opt) => `
                                <option value="${opt}" ${(opt === schedule) ? "selected" : ""}>
                                    ${opt}
                                </option>
                            `).join('\n')}
                        </select>
                    </div>
                    <div class="col-sm-4">
                        <button type="submit" class="btn btn-primary">Schedule Set!</button>
                    </div>
                    <code id="${jsonResultId}"></code>
                </form>
                <hr />
            `;
            return formHtml;
        }).join('\n');
        const schedulesForms = document.getElementById("schedulesForms");
        schedulesForms.innerHTML = formsHtml;

        schedules.forEach((schedule, i) => {
            const { dropdownId } = uiItems[i];
            const dropdown = document.getElementById(dropdownId);
            dropdown.selectedIndex = schedulesOptions.indexOf(schedule);
        });

        uiItems.forEach((uiItem, i) => {
            const { formId, dropdownId, jsonResultId } = uiItem;
            addEventSchedules(i, formId, dropdownId, jsonResultId);
        });
    } catch (error) {
        console.error(error.message);
    }
}


async function updateServerTime() {
    const res = await fetch('/api/time');
    const data = await res.json();
    let serverTimeHtml = '';
    if (data.serverTime) {
        const serverTime = data.serverTime.replace('T', ', ').replace('Z', '');
        serverTimeHtml = `<h5>Server Time: ${serverTime}</h5>`;
    }
    const serverTimeElement = document.getElementById('serverTime');
    serverTimeElement.innerHTML = `${serverTimeHtml}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    // main action after document load
    addEventWebCam();
    addEventBoiler();
    await loadSchedules();
    await updateServerTime();
});
