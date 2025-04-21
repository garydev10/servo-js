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

document.addEventListener('DOMContentLoaded', async () => {
    // main action after document load
    addEventWebCam();
    addEventBoiler();
});
