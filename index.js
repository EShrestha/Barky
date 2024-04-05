const express = require('express');
const path = require('path');
const Speaker = require('speaker');
const { Readable } = require('stream');
const record = require('node-record-lpcm16');
const fs = require("fs")

const app = express();

// Function to read configuration from bark.config file
function readConfig() {
    return JSON.parse(fs.readFileSync('bark.config', 'utf-8'));
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

// Function to play a tone
function playTone(frequency, duration) {
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
}

// Middleware to play tone
function playToneLow(req, res, next) {
    playTone(20000, 2);
    next();
}

function playToneMedium(req, res, next) {
    playTone(22500, 2);
    next();
}

function playToneHigh(req, res, next) {
    playTone(25000, 2);
    next();
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


/// Initial vlaues
let threshold = getThreshold();
let lowTone = getLowToneFrequency();
let mediumTone = getMediumToneFrequency();
let highTone = getHighToneFrequency();

// Sound detection and action
record
    .record()
    .stream()
    .on('data', (data) => {
        // Calculate amplitude and check if it exceeds threshold
        const amplitude = calculateAmplitude(data);
        console.log("AMP:" + amplitude + " THRESHOLD: " + threshold);
        if (amplitude > threshold) {
            // Trigger action when sound exceeds threshold
            console.log('Sound detected, AMP:', amplitude); // Example action
            playTone(1000, 1)
        }
    })
    .on('error', (err) => {
        console.error('Error:', err);
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

// Define routes
app.get('/playToneLow', playToneLow, (req, res) => {
    console.log('Route hit');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/playToneMedium', playToneMedium, (req, res) => {
    console.log('Route hit');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/playToneHigh', playToneHigh, (req, res) => {
    console.log('Route hit');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
