'use strict'

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
    addEventBoiler();
});
