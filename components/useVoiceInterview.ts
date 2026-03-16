import { useState } from "react"

export function useVoiceInterview(){

  const [listening,setListening] = useState(false)
  const [transcript,setTranscript] = useState("")

  let recognition:any = null

  if(typeof window !== "undefined"){

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if(SpeechRecognition){
      recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.lang = "en-US"
      recognition.interimResults = false
    }

  }

  function startListening(){

    if(!recognition) return

    // stop interviewer voice before user speaks
    window.speechSynthesis.cancel()

    recognition.start()
    setListening(true)

    recognition.onresult = (event:any)=>{
      const speech = event.results[0][0].transcript
      setTranscript(speech)
      setListening(false)
    }

  }

  function stopListening(){
    recognition?.stop()
    setListening(false)
  }

  function speak(text:string){

    if(typeof window === "undefined") return

    // stop any currently playing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.lang = "en-US"

    window.speechSynthesis.speak(utterance)

  }

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    speak
  }

}
