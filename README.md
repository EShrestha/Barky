A simple dog bark deterrent you can set up on a Raspberry Pi or whatever you want to host the server on.
A microphone and a speaker must be plugged into the server.
Run the server and access controls on your phone by going to SERVER_IP_ADDRESS:SERVER_PORT, example: 10.0.0.100:300

Host on your own Raspberry Pi or whatever, then simply add it to your phone home screen
(If you want to be able to control the app when you are not at your house then you have to set up port forwarding on your router, then simply go to [YourRoutersPublicIPThatIsPortForwardedToServerIP:ServerPort] and add it to your phone home screen )

- In script.js and index.js change the IP address to your server device IP address

- Change the tone of Khz in the bark.config file if you need to, the default config is:
{
  "isOn": true,
  "threshold": "30000",
  "lowToneFrequency": 20000,
  "mediumToneFrequency": 22500,
  "highToneFrequency": 25000
}

- Simply do "npm install" and then "node index.js" and you should be good

- Must have a speaker and microphone plugged into the Pi or whatever you are using as the server

- Play around with the threshold in the config because each microphone sensitivity is different (don't go above 30000 because it is a 16bit integer in code else it'll crash, instead move the microphone away or turn down its sensitivity if your microphone has that option to dial it in so that 30000 is the loudest volume your dog has to exceed)

- When on, it will automatically play the high tone (25,000 kHz) if the amplitude of the sound exceeds the threshold and you can manually play the low, medium, or high tone.

- When off, automatic tone playing is off, manual controls are off, the whole thing is off
