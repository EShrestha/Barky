document.addEventListener('DOMContentLoaded', async () => {

});


const socket = io.connect("http://192.168.0.100:3000");
const powerSwitch = document.getElementById('powerSwitch');
const frequencyButtons = document.querySelectorAll('.frequency');
const volumeSlider = document.getElementById('volumeSlider');
const thresholdText = document.getElementById('threshold');

    frequencyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the ID of the current button
            const buttonId = button.id;

            // Perform a switch statement based on the button ID
            switch(buttonId) {
                case 'frequencyLow':
                    socket.emit("playToneLow")
                    break;
                case 'frequencyMedium':
                    socket.emit("playToneMedium")
                    break;
                case 'frequencyHigh':
                    socket.emit("playToneHigh")
                    break;
                // Add more cases as needed
                default:
                    // Default case if the button ID doesn't match any case
            }
        });
    });

powerSwitch.addEventListener('change', (evt) => {
    // Send request to backend to toggle power
    if (powerSwitch.checked) {
        socket.emit("turnOn", (success) => {
            if (success) {on();}
        })
    } else {
        socket.emit("turnOff", (success) => {
            if (success) {off();}
        })
    }
});

volumeSlider.addEventListener('input', (evt) => {
    // Send request to backend to set volume
    console.log("THRESH:", evt.target.value)
    socket.emit("updateThreshold", evt.target.value, (success) => {
        if (success) {
            thresholdText.innerText = "Threshold: " + evt.target.value;
        }
    })

});

const off = () => {
    frequencyButtons.forEach(button => {
        button.style.display = "none";
    });
    volumeSlider.style.display = "none";
    thresholdText.style.display = "none";
    powerSwitch.checked = false;
    document.body.style.backgroundColor = "#f38282";

}

const on = () => {
    frequencyButtons.forEach(button => {
        button.style.display = "block";
    });
    volumeSlider.style.display = "block";
    thresholdText.style.display = "block";
    powerSwitch.checked = true;
    document.body.style.backgroundColor = "#83f983";
}


//// SOCKET IO ////
// Listen for threshold updates
socket.on('initialConfig', (config) => {
    // Update UI with new threshold value
    console.log("Got initial config:", config)
    config.isOn ? on() : off();
    thresholdText.innerText = config.threshold
    volumeSlider.value = config.threshold
});

socket.on("turnOn", () => {
    on();
})

socket.on("turnOff", () => {
    off();
})

socket.on("updateThreshold", (value) => {
    volumeSlider.value = value;
    thresholdText.innerText = value;
})