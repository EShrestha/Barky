console.log("WORKS");

const powerSwitch = document.getElementById('powerSwitch');
const frequencyButtons = document.querySelectorAll('.frequency');
const volumeSlider = document.getElementById('volumeSlider');
const thresholdText = document.getElementById('threshold')

powerSwitch.addEventListener('change', (evt) => {
    // Send request to backend to toggle power
    if (powerSwitch.checked) {
        document.body.style.backgroundColor = "#83f983"
        on()
    } else {
        document.body.style.backgroundColor = "#f38282"
        frequencyButtons.forEach(button => {
            button.style.display = "none"
        });
        off()
        
    }
});

frequencyButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Send request to backend to set frequency
    });
});

volumeSlider.addEventListener('input', (evt) => {
    // Send request to backend to set volume
    thresholdText.innerText = "Threshold: " + evt.target.value;

});


////////////////
const off = () => {
    frequencyButtons.forEach(button => {
        button.style.display = "none"
    });
    volumeSlider.style.display = "none"
    thresholdText.style.display = "none"
}

const on = () => {
    frequencyButtons.forEach(button => {
        button.style.display = "block"
    });
    volumeSlider.style.display = "block"
    thresholdText.style.display = "block"

}