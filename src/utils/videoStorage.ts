
// Utility for storing videos using IndexedDB instead of localStorage
const DB_NAME = 'cinebaby_videos';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

interface VideoData {
  id: string;
  patientId: string;
  fileName: string;
  fileBlob: Blob;
  uploadedAt: string;
}

class VideoStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('patientId', 'patientId', { unique: false });
        }
      };
    });
  }

  async saveVideo(video: Omit<VideoData, 'fileBlob'> & { file: File }): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const videoData: VideoData = {
        id: video.id,
        patientId: video.patientId,
        fileName: video.fileName,
        fileBlob: video.file,
        uploadedAt: video.uploadedAt
      };
      
      const request = store.put(videoData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getVideosByPatient(patientId: string): Promise<Array<{
    id: string;
    patientId: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }>> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('patientId');
      const request = index.getAll(patientId);
      
      request.onsuccess = () => {
        const videos = request.result.map((video: VideoData) => ({
          id: video.id,
          patientId: video.patientId,
          fileName: video.fileName,
          fileUrl: URL.createObjectURL(video.fileBlob),
          uploadedAt: video.uploadedAt
        }));
        resolve(videos);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVideo(videoId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(videoId);
      
      request.onsuccess = () => {
        console.log(`Video ${videoId} deleted from IndexedDB`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVideosByPatient(patientId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('patientId');
      const request = index.getAllKeys(patientId);
      
      request.onsuccess = () => {
        const keys = request.result;
        let deletedCount = 0;
        
        if (keys.length === 0) {
          console.log(`No videos found for patient ${patientId} in IndexedDB`);
          resolve();
          return;
        }
        
        keys.forEach((key) => {
          const deleteRequest = store.delete(key);
          deleteRequest.onsuccess = () => {
            deletedCount++;
            if (deletedCount === keys.length) {
              console.log(`${deletedCount} videos deleted from IndexedDB for patient ${patientId}`);
              resolve();
            }
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVideosByClinic(clinicId: string, patientIds: string[]): Promise<void> {
    if (!this.db) await this.init();
    
    console.log(`Deleting videos for clinic ${clinicId} with patients:`, patientIds);
    
    for (const patientId of patientIds) {
      await this.deleteVideosByPatient(patientId);
    }
  }

  async getAllVideos(): Promise<Array<{
    id: string;
    patientId: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }>> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const videos = request.result.map((video: VideoData) => ({
          id: video.id,
          patientId: video.patientId,
          fileName: video.fileName,
          fileUrl: URL.createObjectURL(video.fileBlob),
          uploadedAt: video.uploadedAt
        }));
        resolve(videos);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const videoStorage = new VideoStorage();
