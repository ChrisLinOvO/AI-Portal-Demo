import axios, { AxiosError } from 'axios';
import React, { useState, useEffect } from 'react';


// Function to convert audio blob to base64 encoded string
const audioBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      resolve(base64Audio);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

const SpeechToText: React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcription, setTranscription] = useState<string>('');

  // Cleanup function to stop recording and release media resources
  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);

  const apiKey: string = import.meta.env.VITE_REACT_APP_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("REACT_APP_GOOGLE_API_KEY not found in the environment");
  }

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.start();
      console.log('Recording started');

      // Event listener to handle data availability
      recorder.addEventListener('dataavailable', async (event) => {
        console.log('Data available event triggered');
        const audioBlob = event.data;

        const base64Audio = await audioBlobToBase64(audioBlob);
        //console.log('Base64 audio:', base64Audio);

        try {
          const startTime = performance.now();

          const response = await axios.post(
            `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
            {
              config: {
                encoding: 'WEBM_OPUS',
                sampleRateHertz: 48000,
                languageCode: 'zh-tw',
              },
              audio: {
                content: base64Audio,
              },
            }
          );

          const endTime = performance.now();
          const elapsedTime = endTime - startTime;

          //console.log('API response:', response);
          console.log('Time taken (ms):', elapsedTime);

          if (response.data.results && response.data.results.length > 0) {
            setTranscription(response.data.results[0].alternatives[0].transcript);
          } else {
            console.log('No transcription results in the API response:', response.data);
            setTranscription('No transcription available');
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error('Error with Google Speech-to-Text API:', axiosError.response?.data);
          } else {
            console.error('Unknown error:', error);
          }
        }
      });

      setRecording(true);
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error getting user media:', error);
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      console.log('Recording stopped');
      setRecording(false);
    }
  };

  return (
    <div style={{ background: '#E0E0E0', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'Roboto, sans-serif' }}>
      <h1 style={{ fontSize: '48px', color: '#3F51B5', marginBottom: '40px' }}>Speech to Text</h1>
      {!recording ? (
        <button onClick={startRecording} style={{ background: '#4CAF50', color: 'white', fontSize: '24px', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', marginBottom: '20px', boxShadow: '0 3px 5px rgba(0,0,0,0.3)' }}>Start Recording</button>
      ) : (
        <button onClick={stopRecording} style={{ background: '#F44336', color: 'white', fontSize: '24px', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', marginBottom: '20px', boxShadow: '0 3px 5px rgba(0,0,0,0.3)' }}>Stop Recording</button>
      )}
      <p style={{ fontSize: '24px', color: '#212121', maxWidth: '80%', lineHeight: '1.5', textAlign: 'left', background: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>Transcription: {transcription}</p>
    </div>
  );
};

export default SpeechToText;
