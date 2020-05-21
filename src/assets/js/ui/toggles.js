var med = null;

export default class Toggles {
  constructor(mediator) {
    med = mediator;
    this.init();
    self = this;
  }

  init() {
    this.initToggleVideo();
    this.initToggleAudio();
    this.initToggleScreenShare();
    this.initToggleAudioRecording();
  }

  initToggleVideo() {
    document.getElementById("toggle-video").addEventListener("click", e => {
      e.preventDefault();
      if (!med.videoMuted) {
        med.videoMuted = true;
        e.srcElement.classList.remove("fa-video");
        e.srcElement.classList.add("fa-video-slash");
        med.h.showNotification("Video Disabled");
      } else {
        med.videoMuted = false;
        e.srcElement.classList.add("fa-video");
        e.srcElement.classList.remove("fa-video-slash");
        med.h.showNotification("Video Enabled");
      }
      window.ee.emit("video-toggled")
    });
  }

  initToggleAudio() {
    document.getElementById("toggle-mute").addEventListener("click", e => {
      e.preventDefault();
      if (!med.audioMuted) {
        med.audioMuted = true;
        e.srcElement.classList.remove("fa-volume-up");
        e.srcElement.classList.add("fa-volume-mute");
        med.metaData.sendNotificationData({ username: med.username, subEvent: "mute", muted: med.audioMuted });
        med.h.showNotification("Audio Muted");
      } else {
        med.audioMuted = false;
        e.srcElement.classList.add("fa-volume-up");
        e.srcElement.classList.remove("fa-volume-mute");
        med.metaData.sendNotificationData({ username: med.username, subEvent: "mute", muted: med.audioMuted });
        med.h.showNotification("Audio Unmuted");
      }
      window.ee.emit("audio-toggled")
    });
  }

  initToggleScreenShare() {
    document.getElementById("toggle-screen").addEventListener("click", async e => {
      e.preventDefault();
      if (!med.screenShare) {
        med.screenShare = true;
        e.srcElement.classList.add("sharing");
        e.srcElement.classList.remove("text-white");
        e.srcElement.classList.add("text-black");
      } else {
        med.screenShare = false;
        e.srcElement.classList.remove("sharing");
        e.srcElement.classList.add("text-white");
        e.srcElement.classList.remove("text-black");
      }
      window.ee.emit("screen-toggled")
    });
  }

  initToggleAudioRecording() {
    document.getElementById("record-toggle").addEventListener("click", e => {
      e.preventDefault();
      if (!med.isRecording) {
        med.h.recordAudio();
        med.isRecording = true
        e.srcElement.classList.add("text-danger");
        e.srcElement.classList.remove("text-white");
        med.h.showNotification("Recording Started");
      } else {
        med.h.stopRecordAudio()
        med.isRecording = false
        e.srcElement.classList.add("text-white");
        e.srcElement.classList.remove("text-danger");
        med.h.showNotification("Recording Stopped");
      }
      med.metaData.sendNotificationData({ username: med.username, subEvent: "recording", isRecording: med.isRecording })
      window.ee.emit("record-audio-toggled")
    });
  }
}
