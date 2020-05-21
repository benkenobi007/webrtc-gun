import EventEmitter from "../ee.js";
import Room from "./room.js";
import helper from "../helpers.js"

export default class SFU extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        console.log("SFU::config::%s", JSON.stringify(config));
        this.sfuRoom = new Room();
    }

    init() {
        console.log("SFU::Init");
        this.sfuRoom.on("@open", ({ peers }) => {
            console.log(`${peers.length} peers in this room.`);
            this.emit("readyToCall");
        });

        this.sfuRoom.on("@consumer", async consumer => {
            const {
                id,
                appData: { peerId },
                track
            } = consumer;
            this.emit("incoming_peer", consumer);

            var video = this.createRemote(consumer);
            if (video) {
                const peer = {
                    video: video,
                    consumer: consumer
                }

                this.emit('videoAdded', peer);
            }
        });

        this.sfuRoom.on("@peerClosed", async id => {
            this.emit("videoRemoved", id);
        });

        this.sfuRoom.on("@consumerClosed", async id => {
            this.emit("videoRemoved", id);
        });

        this.sfuRoom.on("@peerJoined", async id => {
            this.emit("readyToCall");
        });

    }

    joinRoom(room, peerId) {
        console.log("SFU::Join %s meething", room);
        this.room = room;
        this.sfuRoom.join(room, peerId);
    }

    async startBroadcast() {
        if (!this.broadcasting) {
            try {
                this.broadcasting = true;
                const video = this.config.localVideoEl;
                this.videoProducer = await this.sfuRoom.sendVideo(video.srcObject.getVideoTracks()[0]);
                this.audioProducer = await this.sfuRoom.sendAudio(video.srcObject.getAudioTracks()[0]);

                var self = this;
                // Attach SoundMeter to Local Stream
                if (SoundMeter) {
                    // Soundmeter
                    const soundMeter = new SoundMeter(function () {
                        self.emit("soundmeter");
                    });
                    soundMeter.connectToSource(video.srcObject);
                } else { console.error('no soundmeter!'); }
            } catch (error) {
                console.error("Too early sending video");
                this.broadcasting = false;
            }
        }
    }

    async startScreenShare() {
        var stream = await helper.getDisplayMedia({ audio: true, video: true });
        var screenTrack = stream.getVideoTracks()[0];
        this.screenProducer = await this.sfuRoom.sendScreen(screenTrack);
    }

    //Move this to a helper?
    startLocalVideo() {
        console.log("SFU::startLocalVideo");
        this.attachMedia();
    }

    //Move this to a helper?
    attachMedia() {
        console.log("SFU::attachMedia");
        const self = this;
        const localVideo = this.config.localVideoEl;

        helper.getUserMedia()
            .then(async stream => {
                if (localVideo) h.setVideoSrc(localVideo, stream);
                self.emit("localStream");

            }).catch(function (error) {
                console.log("Something went wrong!");
                self.emit("localMediaError");
            });
    }

    //Move this to a helper?
    createRemote(consumer) {
        var video = document.getElementById(consumer._appData.peerId + "-video");
        if (video == undefined) {
            video = helper.addVideo(consumer._appData.peerId);
            return video;
        } else if (video.srcObject.getVideoTracks().length > 0 && consumer._track.kind == "video") {
            video = helper.addVideo(consumer._id);
            return video;
        } else {
            return video;
        }
    }

    toggleVideo() {
        if (this.videoProducer.paused) {
            this.videoProducer.resume();
        } else {
            this.videoProducer.pause();
        }
    }

    toggleAudio() {
        if (this.audioProducer.paused) {
            this.audioProducer.resume();
        } else {
            this.audioProducer.pause();
        }
    }

    async toggleScreen() {
        if (!this.screenProducer || this.screenProducer._closed) {
            await this.startScreenShare();
        } else {
            this.screenProducer.close();
            this.screenProducer._events.trackended()
        }
    }
}
