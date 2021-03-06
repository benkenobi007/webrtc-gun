// VIP: Patch the faceapi.js to avoid env errors
self.importScripts('faceEnvWorkerPatch.js')
self.importScripts('face-api.min.js');

global = {}
require = function () {}
module = {}
process = {
    version: 1.0
}

self.global = global
self.require = require
self.module = module
self.process = process

function testNode() {
    return typeof global === 'object' &&
        typeof require === 'function' &&
        typeof module !== 'undefined'
        // issues with gatsby.js: module.exports is undefined
        // && !!module.exports
        &&
        typeof process !== 'undefined' && !!process.version
}
console.log("Testing Node env:\n", "global: ", typeof global === 'object', '\nrequire: ', typeof require === 'function',
    '\nmodule: ', typeof module !== 'undefined', '\nprocess: ', typeof process !== 'undefined' && !!process.version)

var loaded = false

faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models').then(
    async () => {
            this.console.log("Try to load")
            loaded = true
            console.log('Model Loaded')
        },
        (err) => {
            console.log("failed")
            this.console.log(err)
        }
);

this.onmessage = async function handler(e) {

    if (!loaded) return;

    this.console.log(e.data.videoFrame)
    if (e.data.videoFrame !== 'undefined') {
        //this.console.log("Got the frame !")
        var frame = e.data.videoFrame
        this.displaySize = {
            width: e.data.width,
            height: e.data.height
        }
        var canvas = new OffscreenCanvas(this.displaySize.width, this.displaySize.height)
        faceapi.matchDimensions(canvas, displaySize)
        canvas.getContext('bitmaprenderer').transferFromImageBitmap(frame);
        try {
            const detections = await faceapi.detectSingleFace(canvas,
                new faceapi.TinyFaceDetectorOptions())
            
            if (!detections) return;
            this.console.log('detections: ', detections)
            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            //Send Bounding box to main thread
            var message = {
                boundingBox: {
                    xmin: resizedDetections.box.x,
                    ymin: resizedDetections.box.y,
                    width: resizedDetections.box.width,
                    height: resizedDetections.box.height
                }
            }
            this.postMessage(message)
        } catch (err) {
            this.console.log(err)
        }
    }
}
