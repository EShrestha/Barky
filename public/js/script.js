const socket = io.connect("http://192.168.0.100:3000");
const powerSwitch = document.getElementById('powerSwitch');
const frequencyButtons = document.querySelectorAll('.frequency');
const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdText = document.getElementById('threshold');

    frequencyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonId = button.id;

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
                default:
                    console.log("👀")
            }
        });
    });

powerSwitch.addEventListener('change', (evt) => {
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

thresholdSlider.addEventListener('input', (evt) => {
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
    thresholdSlider.style.display = "none";
    thresholdText.style.display = "none";
    powerSwitch.checked = false;
    document.body.style.backgroundColor = "#f38282";

}

const on = () => {
    frequencyButtons.forEach(button => {
        button.style.display = "block";
    });
    thresholdSlider.style.display = "block";
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
    thresholdSlider.value = config.threshold
});

socket.on("turnOn", () => {
    on();
})

socket.on("turnOff", () => {
    off();
})

socket.on("updateThreshold", (value) => {
    thresholdSlider.value = value;
    thresholdText.innerText = value;
})