
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Mail, Trash2, Users, Video, Plus } from 'lucide-react';
import { Clinic, Patient, Video as VideoType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import CreateClinicDialog from './CreateClinicDialog';

interface ClinicsTabProps {
  clinics: Clinic[];
  setClinics: (clinics: Clinic[]) => void;
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  videos: VideoType[];
  setVideos: (videos: VideoType[]) => void;
}

const ClinicsTab: React.FC<ClinicsTabProps> = ({ 
  clinics, 
  setClinics, 
  patients, 
  setPatients, 
  videos, 
  setVideos 
}) => {
  const { toast } = useToast();

  const handleDeleteClinic = (clinicId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica? Todos os dados serão permanentemente perdidos.')) {
      return;
    }

    // Remove clinic
    const updatedClinics = clinics.filter(c => c.id !== clinicId);
    setClinics(updatedClinics);
    localStorage.setItem('cinebaby_clinics', JSON.stringify(updatedClinics));

    // Remove related patients and videos
    const clinicPatients = patients.filter((p: Patient) => p.clinicId === clinicId);
    const patientIds = clinicPatients.map((p: Patient) => p.id);
    
    const filteredPatients = patients.filter((p: Patient) => p.clinicId !== clinicId);
    const filteredVideos = videos.filter((v: VideoType) => !patientIds.includes(v.patientId));
    
    setPatients(filteredPatients);
    setVideos(filteredVideos);
    localStorage.setItem('cinebaby_patients', JSON.stringify(filteredPatients));
    localStorage.setItem('cinebaby_videos', JSON.stringify(filteredVideos));

    toast({
      title: "Clínica excluída!",
      description: "A clínica e todos os dados relacionados foram removidos.",
      variant: "destructive"
    });
  };

  const getClinicStats = (clinicId: string) => {
    const clinicPatients = patients.filter((p: Patient) => p.clinicId === clinicId);
    const patientIds = clinicPatients.map((p: Patient) => p.id);
    const clinicVideos = videos.filter((v: VideoType) => patientIds.includes(v.patientId));
    
    return {
      patientsCount: clinicPatients.length,
      videosCount: clinicVideos.length
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Gerenciar Clínicas</h3>
          <p className="text-gray-600">Cadastre e gerencie as clínicas da plataforma</p>
        </div>
        
        <CreateClinicDialog clinics={clinics} setClinics={setClinics} />
      </div>

      {clinics.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma clínica cadastrada</h3>
            <p className="text-gray-600 mb-4">Comece cadastrando a primeira clínica da plataforma</p>
            <CreateClinicDialog clinics={clinics} setClinics={setClinics} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clinics.map((clinic) => {
            const stats = getClinicStats(clinic.id);
            return (
              <Card key={clinic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-cinebaby-purple" />
                      <CardTitle className="text-lg">{clinic.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClinic(clinic.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {clinic.address}, {clinic.city}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {clinic.email}
                  </div>
                  
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {stats.patientsCount} pacientes
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Video className="h-4 w-4 mr-1" />
                      {stats.videosCount} vídeos
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClinicsTab;
