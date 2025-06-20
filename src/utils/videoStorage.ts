
// IndexedDB storage for video files
interface VideoData {
  id: string;
  patient_id: string;
  file_name: string;
  uploaded_at: string;
  file?: File;
  file_url?: string;
}

class VideoStorage {
  private dbName = 'CineBabyVideos';
  private version = 1;
  private storeName = 'videos';

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('patient_id', 'patient_id', { unique: false });
        }
      };
    });
  }

  async saveVideo(videoData: VideoData): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    // Create file URL for video if file exists
    if (videoData.file) {
      videoData.file_url = URL.createObjectURL(videoData.file);
    }

    return new Promise((resolve, reject) => {
      const request = store.put(videoData);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Video saved to IndexedDB:', videoData.id);
        resolve();
      };
    });
  }

  async getVideosByPatient(patientId: string): Promise<VideoData[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('patient_id');

    return new Promise((resolve, reject) => {
      const request = index.getAll(patientId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Videos retrieved from IndexedDB for patient:', patientId, request.result);
        resolve(request.result || []);
      };
    });
  }

  async deleteVideo(videoId: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      // First get the video to revoke its URL
      const getRequest = store.get(videoId);
      getRequest.onsuccess = () => {
        const video = getRequest.result;
        if (video && video.file_url) {
          URL.revokeObjectURL(video.file_url);
        }
        
        // Then delete the video
        const deleteRequest = store.delete(videoId);
        deleteRequest.onerror = () => reject(deleteRequest.error);
        deleteRequest.onsuccess = () => {
          console.log('Video deleted from IndexedDB:', videoId);
          resolve();
        };
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteVideosByClinic(clinicId: string, patientIds: string[]): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    for (const patientId of patientIds) {
      const videos = await this.getVideosByPatient(patientId);
      for (const video of videos) {
        if (video.file_url) {
          URL.revokeObjectURL(video.file_url);
        }
        await new Promise<void>((resolve, reject) => {
          const deleteRequest = store.delete(video.id);
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onsuccess = () => resolve();
        });
      }
    }
    
    console.log(`All videos for clinic ${clinicId} deleted from IndexedDB`);
  }
}

export const videoStorage = new VideoStorage();
