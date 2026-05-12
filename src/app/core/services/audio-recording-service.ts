import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  
  // Signal para o UI reagir (botão pulsando, etc)
  isRecording = signal<boolean>(false);
  recordingTime = signal<number>(0);
  private timerInterval: any;

  
    //Inicia a gravação
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.startTimer();
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      throw error;
    }
  }

  
   //Para a gravação e retorna o arquivo (Blob)
  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return;

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        // Limpeza: para o microfone de fato
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        
        this.isRecording.set(false);
        this.stopTimer();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private startTimer() {
    this.recordingTime.set(0);
    this.timerInterval = setInterval(() => {
      this.recordingTime.update(t => t + 1);
    }, 1000);
  }

  private stopTimer() {
    clearInterval(this.timerInterval);
  }
}