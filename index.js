const express = require('express');
const path = require('path');
const Speaker = require('speaker');
const { Readable } = require('stream');
const record = require('node-record-lpcm16');
const fs = require("fs")
const socket = require("socket.io")


const DEBUG = true;
const debug = (msg) => { if (DEBUG) { console.log(msg) };}

const port = process.env.PORT || 3000;
const app = express();
const server = app.listen(port, () => {
    debug(`Server is running on port ${port}`);
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

var io = socket(server)

// Function to read configuration from bark.config file
function readConfig() {
    return JSON.parse(fs.readFileSync('bark.config', 'utf-8'));
}

function getIsOn() {
    const config = readConfig();
    return config.isOn;
}

// Function to get threshold from config
function getThreshold() {
    const config = readConfig();
    return config.threshold;
}

// Function to get low tone frequency from config
function getLowToneFrequency() {
    const config = readConfig();
    return config.lowToneFrequency;
}
function getMediumToneFrequency() {
    const config = readConfig();
    return config.lowToneFrequency;
}
function getHighToneFrequency() {
    const config = readConfig();
    return config.lowToneFrequency;
}

/// Initial vlaues
let isOn = getIsOn();
let threshold = getThreshold();
let lowTone = getLowToneFrequency();
let mediumTone = getMediumToneFrequency();
let highTone = getHighToneFrequency();
let defaultAutoTone = highTone;

function updateIsOn(isOn) {
    try {
        const config = readConfig();
        config.isOn = isOn;
        fs.writeFileSync('bark.config', JSON.stringify(config, null, 2));
        
    } catch (err) {
        return false;
    }
    return true;
}

function updateThreshold(threshold) {
    try {
        const config = readConfig();
        config.threshold = threshold;
        fs.writeFileSync('bark.config', JSON.stringify(config, null, 2));
        
    } catch (err) {
        return false;
    }
    return true;
}
// Function to generate a sine wave buffer
function generateSineWave(duration, frequency, sampleRate) {
    const numSamples = duration * sampleRate;
    const buffer = Buffer.alloc(numSamples * 2);
    for (let i = 0; i < numSamples; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
        const sample16 = sample * 32767; // 16-bit signed integer
        buffer.writeInt16LE(sample16, i * 2);
    }
    return buffer;
}

let isTonePlaying = false; 
function playTone(frequency, duration) {
    if (isTonePlaying) {
        debug("Already playing tone")
        return; // If a tone is already playing, do nothing
    }
    isTonePlaying = true;
    const sampleRate = 44100; // 44.1 kHz sample rate
    const buffer = generateSineWave(duration, frequency, sampleRate);
    const speaker = new Speaker({
        channels: 1,          // Mono
        bitDepth: 16,         // 16-bit
        sampleRate: sampleRate
    });
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Signal end of data
    stream.pipe(speaker);

    setTimeout(() => {
        isTonePlaying = false;
    }, duration * 1000 + 100); // Adding some buffer time to ensure the tone has finished playing
}


// Auto sound detection and action
record
    .record()
    .stream()
    .on('data', (data) => {
        // Calculate amplitude and check if it exceeds threshold
        const amplitude = calculateAmplitude(data);
        debug("THRESHOLD: " + threshold + " | AMPLITUDE:" + amplitude);
        if (amplitude > threshold) {
            // Trigger action when sound exceeds threshold
            debug('THRESHOLD EXCEEDED. AMPLITUDE:', amplitude);
            playTone(defaultAutoTone, 2)
        }
    })
    .on('error', (err) => {
        debug('Error:', err);
    });

// Function to calculate amplitude from audio buffer
function calculateAmplitude(buffer) {
    let maxAmplitude = 0;
    for (let i = 0; i < buffer.length; i += 2) {
        const sample = buffer.readInt16LE(i);
        const amplitude = Math.abs(sample);
        if (amplitude > maxAmplitude) {
            maxAmplitude = amplitude;
        }
    }
    return maxAmplitude;
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));

})



//// SOCKET IO ////
io.on('connection', (socket) => {
    debug('Client connected');
    
    // Emit initial values to newly connected client
    socket.emit('initialConfig', readConfig());

    socket.on("turnOn", (cb) => {
        if (updateIsOn(true)) {
            isOn = true;
            socket.broadcast.emit("turnOn")
            cb(true)
            
        } else {
            cb(false)
        }
    })
    
    socket.on("turnOff", (cb) => {
        if (updateIsOn(false)) {
            isOn = false;
            socket.broadcast.emit("turnOff")
            cb(true)
            
        } else {
            cb(false)
        }
    })

    socket.on('updateThreshold', (value, cb) => {
        if (updateThreshold(value)) {
            threshold = value;
            socket.broadcast.emit("updateThreshold", value)
            cb(true)
            
        } else {
            cb(false)
        }
    });
    
    socket.on('playToneLow', () => {
        if (isOn) {playTone(lowTone, 2);}
    });

    socket.on('playToneMedium', () => {
        if (isOn) {playTone(mediumTone, 2);}
    });
    
    socket.on('playToneHigh', () => {
        if (isOn) {playTone(highTone, 2);}
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        debug('Client disconnected');
    });
});
