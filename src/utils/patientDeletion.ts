
import { videoStorage } from './videoStorage';
import { Patient, Video, Clinic } from '@/types';

export const deletePatientCompletely = async (
  patientId: string,
  patients: Patient[],
  setPatients: (patients: Patient[]) => void,
  videos: Video[],
  setVideos: (videos: Video[]) => void
) => {
  try {
    // Delete all videos from IndexedDB for this patient
    const patientVideos = videos.filter(v => v.patient_id === patientId);
    
    for (const video of patientVideos) {
      await videoStorage.deleteVideo(video.id);
    }

    // Remove videos from localStorage as fallback cleanup
    const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
    const updatedVideos = allVideos.filter((v: Video) => v.patient_id !== patientId);
    localStorage.setItem('cinebaby_videos', JSON.stringify(updatedVideos));
    setVideos(updatedVideos);

    // Remove patient
    const allPatients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
    const updatedPatients = allPatients.filter((p: Patient) => p.id !== patientId);
    localStorage.setItem('cinebaby_patients', JSON.stringify(updatedPatients));
    setPatients(updatedPatients);

    console.log(`Patient ${patientId} and all associated videos permanently deleted`);
    
    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
};
