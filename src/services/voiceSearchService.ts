export const startVoiceSearch = (setSearch:any) => {

const SpeechRecognition =
(window as any).SpeechRecognition ||
(window as any).webkitSpeechRecognition;

if(!SpeechRecognition){
alert("Voice search not supported");
return;
}

const recognition = new SpeechRecognition();

recognition.lang = "hi-IN"; // Hindi + English
recognition.continuous = false;
recognition.interimResults = false;

recognition.start();

recognition.onresult = (event:any) => {

const transcript = event.results[0][0].transcript;

setSearch(transcript);

};

recognition.onerror = (event:any) => {
console.log("Voice error",event);
};

};
