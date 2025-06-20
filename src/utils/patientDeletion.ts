
import { videoStorage } from './videoStorage';
import { Patient, Video } from '@/types';

export const deletePatientPermanently = async (
  patientId: string,
  patients: Patient[],
  setPatients: (patients: Patient[]) => void,
  videos: Video[],
  setVideos: (videos: Video[]) => void
) => {
  try {
    console.log(`Starting permanent deletion of patient ${patientId}`);

    // Delete all videos for this patient from IndexedDB
    await videoStorage.deleteVideosByPatient(patientId);

    // Remove videos from localStorage as fallback cleanup
    const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
    const updatedVideos = allVideos.filter((v: Video) => v.patientId !== patientId);
    localStorage.setItem('cinebaby_videos', JSON.stringify(updatedVideos));
    setVideos(updatedVideos);

    // Remove patient from localStorage
    const updatedPatients = patients.filter(p => p.id !== patientId);
    setPatients(updatedPatients);
    localStorage.setItem('cinebaby_patients', JSON.stringify(updatedPatients));

    console.log(`Patient ${patientId} and all associated videos permanently deleted`);
    
    return true;
  } catch (error) {
    console.error('Error deleting patient permanently:', error);
    throw error;
  }
};
