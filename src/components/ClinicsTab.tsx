import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, MapPin, Mail, Calendar, Users, Trash2, Plus, Video, Eye } from 'lucide-react';
import { Clinic, Patient, Video as VideoType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import CreateClinicDialog from './CreateClinicDialog';
import AdminClinicVideosDialog from './AdminClinicVideosDialog';

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
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  const handleDeleteClinic = async (clinicId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica? Todos os pacientes e vídeos associados também serão removidos permanentemente.')) {
      return;
    }

    try {
      // Get all patients from this clinic
      const clinicPatients = patients.filter(p => p.clinicId === clinicId);
      const clinicPatientIds = clinicPatients.map(p => p.id);
      
      console.log(`Deleting clinic ${clinicId} with ${clinicPatients.length} patients and their videos`);

      // Delete all videos from IndexedDB for this clinic's patients
      await videoStorage.deleteVideosByClinic(clinicId, clinicPatientIds);

      // Remove videos from localStorage as fallback cleanup
      const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
      const updatedVideos = allVideos.filter((v: VideoType) => !clinicPatientIds.includes(v.patientId));
      localStorage.setItem('cinebaby_videos', JSON.stringify(updatedVideos));
      setVideos(updatedVideos);

      // Remove patients from this clinic
      const updatedPatients = patients.filter(p => p.clinicId !== clinicId);
      setPatients(updatedPatients);
      localStorage.setItem('cinebaby_patients', JSON.stringify(updatedPatients));

      // Remove clinic
      const updatedClinics = clinics.filter(c => c.id !== clinicId);
      setClinics(updatedClinics);
      localStorage.setItem('cinebaby_clinics', JSON.stringify(updatedClinics));

      console.log(`Clinic ${clinicId} and all associated data permanently deleted`);

      toast({
        title: "Clínica excluída!",
        description: "A clínica e todos os dados associados foram removidos permanentemente de todos os locais de armazenamento.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting clinic:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a clínica completamente. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getClinicStats = (clinicId: string) => {
    const clinicPatients = patients.filter(p => p.clinicId === clinicId);
    const clinicVideos = videos.filter(v => 
      clinicPatients.some(p => p.id === v.patientId)
    );
    
    return {
      patientCount: clinicPatients.length,
      videoCount: clinicVideos.length
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Clínicas Cadastradas</h3>
          <p className="text-gray-600">Gerencie as clínicas da plataforma</p>
        </div>
        
        <CreateClinicDialog 
          clinics={clinics}
          setClinics={setClinics}
        />
      </div>

      {clinics.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma clínica cadastrada</h3>
            <p className="text-gray-600">Comece adicionando a primeira clínica</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-cinebaby-purple" />
              Lista de Clínicas ({clinics.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clínica</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Estatísticas</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinics.map((clinic) => {
                  const stats = getClinicStats(clinic.id);
                  return (
                    <TableRow key={clinic.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-cinebaby-purple" />
                          <div>
                            <p className="font-medium">{clinic.name}</p>
                            <p className="text-sm text-gray-500">{clinic.address}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {clinic.city}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {clinic.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Users className="h-3 w-3 mr-1 text-cinebaby-turquoise" />
                            {stats.patientCount} pacientes
                          </div>
                          <div className="flex items-center text-sm">
                            <Video className="h-3 w-3 mr-1 text-cinebaby-purple" />
                            {stats.videoCount} vídeos
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(clinic.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/admin/clinic/${clinic.id}`}
                            className="text-cinebaby-turquoise hover:bg-cinebaby-turquoise hover:text-white"
                          >
                            <Building2 className="h-4 w-4 mr-1" />
                            Acessar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedClinicId(clinic.id)}
                            className="text-cinebaby-purple hover:bg-cinebaby-purple hover:text-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Vídeos
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClinic(clinic.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedClinicId && (
        <AdminClinicVideosDialog
          clinicId={selectedClinicId}
          clinics={clinics}
          patients={patients}
          videos={videos}
          setVideos={setVideos}
          onClose={() => setSelectedClinicId(null)}
        />
      )}
    </div>
  );
};

export default ClinicsTab;
