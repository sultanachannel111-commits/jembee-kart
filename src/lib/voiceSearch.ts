export function startVoiceSearch(setSearch:any){

const SpeechRecognition =
window.SpeechRecognition ||
(window as any).webkitSpeechRecognition;

if(!SpeechRecognition){
alert("Voice search not supported");
return;
}

const recognition = new SpeechRecognition();

recognition.lang = "en-IN";
recognition.start();

recognition.onresult = (event:any)=>{

const text = event.results[0][0].transcript;

setSearch(text);

};

}
