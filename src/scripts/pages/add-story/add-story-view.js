export default class AddStoryView {
    constructor() {
        this.form = null;
        this.photoInput = null;
        this.captureButton = null;
        this.switchCameraButton = null;
        this.video = null;
        this.canvas = null;
        this.cameraPreview = null;
        this.photoPreview = null;
        this.loadingContainer = null;
        this.dialog = null;
        this.dialogMessage = null;
        this.dialogClose = null;
        this._stream = null;
        this._facingMode = "user";
        this._marker = null;
        this._map = null;
        this._onNavigate = null;
    }

    setNavigationCallback(callback) {
        this._onNavigate =
            callback ||
            ((path) => {
                window.location.hash = path;
            });
    }

    render() {
        return `
      <section class="container add-story-section">
        <h1 class="section-title">Share Your Story</h1>
        <p class="guest-note">You can post a story as a guest without logging in.</p>
        <form id="story-form" class="story-form">
          <div class="form-group">
            <label for="description">Story Description</label>
            <textarea id="description" name="description" required placeholder="Tell us your story..."></textarea>
          </div>
          <div class="form-group">
            <label for="photo">Upload or Capture Photo</label>
            <div class="photo-input-container">
              <input type="file" id="photo" name="photo" accept="image/*" required>
              <button type="button" id="capture-photo" class="capture-button">
                <i class="fas fa-camera"></i> Capture Photo
              </button>
              <button type="button" id="switch-camera" class="switch-camera-button" style="display: none;">
                <i class="fas fa-sync-alt"></i> Switch Camera
              </button>
            </div>
            <div class="camera-preview" style="display: none;">
              <video id="camera-stream" autoplay></video>
              <canvas id="camera-canvas" style="display: none;"></canvas>
              <div id="photo-preview" style="margin-top: 10px;"></div>
            </div>
          </div>
          <div class="form-group">
            <label for="map">Select Location</label>
            <div id="map" style="height: 400px;"></div>
            <input type="hidden" id="lat" name="lat">
            <input type="hidden" id="lon" name="lon">
          </div>
          <button type="submit" class="submit-button">Post Story</button>
        </form>
        <dialog id="alert-dialog" class="alert-dialog">
          <div class="dialog-content">
            <p id="alert-message"></p>
            <button id="dialog-close" class="dialog-button">OK</button>
          </div>
        </dialog>
        <div class="loading-container" aria-live="polite" aria-busy="false">
          <div class="loader" aria-label="Loading"></div>
        </div>
      </section>
    `;
    }

    initializeDOM() {
        this.form = document.querySelector("#story-form");
        this.photoInput = document.querySelector("#photo");
        this.captureButton = document.querySelector("#capture-photo");
        this.switchCameraButton = document.querySelector("#switch-camera");
        this.video = document.querySelector("#camera-stream");
        this.canvas = document.querySelector("#camera-canvas");
        this.cameraPreview = document.querySelector(".camera-preview");
        this.photoPreview = document.querySelector("#photo-preview");
        this.loadingContainer = document.querySelector(".loading-container");
        this.dialog = document.querySelector("#alert-dialog");
        this.dialogMessage = document.querySelector("#alert-message");
        this.dialogClose = document.querySelector("#dialog-close");
    }

    setupEventListeners({ onCapturePhoto, onSubmitForm, onCloseDialog }) {
        this.initializeDOM();

        this.captureButton.addEventListener("click", async () => {
            if (this._stream) {
                if (this.video.readyState >= 2) {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    const context = this.canvas.getContext("2d");
                    context.drawImage(
                        this.video,
                        0,
                        0,
                        this.canvas.width,
                        this.canvas.height
                    );
                    this.canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                this.showDialog(
                                    "Failed to capture photo",
                                    false
                                );
                                return;
                            }
                            const file = new File([blob], "photo.jpg", {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            const dt = new DataTransfer();
                            dt.items.add(file);
                            this.photoInput.files = dt.files;
                            this.cameraPreview.style.display = "none";
                            this._stopStream();
                            this.captureButton.innerHTML =
                                '<i class="fas fa-camera"></i> Capture Photo';
                            this.switchCameraButton.style.display = "none";

                            this.photoPreview.innerHTML = "";
                            const previewImg = document.createElement("img");
                            previewImg.src = URL.createObjectURL(blob);
                            previewImg.style.maxWidth = "100%";
                            previewImg.style.borderRadius = "8px";
                            this.photoPreview.appendChild(previewImg);
                        },
                        "image/jpeg",
                        0.95
                    );
                } else {
                    this.showDialog(
                        "Video stream not ready. Please try again.",
                        false
                    );
                }
            } else {
                this._stream = await onCapturePhoto(this._facingMode);
                if (this._stream) {
                    this.cameraPreview.style.display = "block";
                    this.switchCameraButton.style.display = "block";
                    this.video.srcObject = this._stream;
                    this.video.play();
                    this.captureButton.innerHTML =
                        '<i class="fas fa-camera"></i> Take Photo';
                    this.video.onloadedmetadata = () => {
                        this.video.play();
                    };
                }
            }
        });

        this.switchCameraButton.addEventListener("click", async () => {
            this._facingMode =
                this._facingMode === "user" ? "environment" : "user";
            this._stopStream();
            this._stream = await onCapturePhoto(this._facingMode);
            if (this._stream) {
                this.video.srcObject = this._stream;
                this.video.play();
                this.switchCameraButton.innerHTML = `<i class="fas fa-sync-alt"></i> Switch to ${
                    this._facingMode === "user" ? "Rear" : "Front"
                } Camera`;
            } else {
                this.showDialog("Failed to switch camera", false);
                this.cameraPreview.style.display = "none";
                this.switchCameraButton.style.display = "none";
            }
        });

        this.form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const description = this.form.querySelector("#description").value;
            const photo = this.photoInput.files[0];
            const lat = this.form.querySelector("#lat").value || null;
            const lon = this.form.querySelector("#lon").value || null;
            await onSubmitForm({ description, photo, lat, lon });
        });

        this.dialogClose.addEventListener("click", () => {
            this.dialog.close();
            onCloseDialog();
        });

        window.addEventListener("beforeunload", () => {
            this.cleanup();
        });
    }

    showDialog(message, success = false) {
        this.dialogMessage.textContent = message;
        this.dialog.showModal();
        this.dialogClose.focus();

        if (success) {
            setTimeout(() => {
                this.dialog.close();
                this._onNavigate("/");
            }, 1000);
        }
    }

    showLoading() {
        this.loadingContainer.classList.add("active");
        this.loadingContainer.setAttribute("aria-busy", "true");
    }

    hideLoading() {
        this.loadingContainer.classList.remove("active");
        this.loadingContainer.setAttribute("aria-busy", "false");
    }

    setupMap() {
        if (this._map) {
            this._map.remove();
            this._map = null;
        }

        this._map = L.map("map").setView([-6.2088, 106.8456], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(this._map);

        this._map.on("click", (e) => {
            const { lat, lng } = e.latlng;
            this.updateMapMarker(lat, lng, this._map);
        });
    }

    updateMapMarker(lat, lng, map) {
        document.querySelector("#lat").value = lat;
        document.querySelector("#lon").value = lng;
        if (this._marker) map.removeLayer(this._marker);
        this._marker = L.marker([lat, lng]).addTo(map);
    }

    _stopStream() {
        if (this._stream) {
            this._stream.getTracks().forEach((track) => track.stop());
            this._stream = null;
            if (this.video) {
                this.video.srcObject = null;
            }
        }
    }

    cleanup() {
        this._stopStream();
        if (this._map) {
            this._map.remove();
            this._map = null;
        }
        this._marker = null;

        if (this.photoPreview) {
            this.photoPreview.innerHTML = "";
        }
        if (this.cameraPreview) {
            this.cameraPreview.style.display = "none";
        }
        if (this.switchCameraButton) {
            this.switchCameraButton.style.display = "none";
        }
        if (this.captureButton) {
            this.captureButton.innerHTML =
                '<i class="fas fa-camera"></i> Capture Photo';
        }
        this._facingMode = "user";
    }
}
