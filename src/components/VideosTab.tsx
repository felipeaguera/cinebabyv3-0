
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Video, Play, Calendar, User, Building2, Trash2 } from 'lucide-react';
import { Clinic, Patient, Video as VideoType } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface VideosTabProps {
  videos: VideoType[];
  setVideos: (videos: VideoType[]) => void;
  patients: Patient[];
  clinics: Clinic[];
}

const VideosTab: React.FC<VideosTabProps> = ({ videos, setVideos, patients, clinics }) => {
  const { toast } = useToast();

  const handleDeleteVideo = (videoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) {
      return;
    }

    const updatedVideos = videos.filter(v => v.id !== videoId);
    setVideos(updatedVideos);
    localStorage.setItem('cinebaby_videos', JSON.stringify(updatedVideos));

    toast({
      title: "Vídeo excluído!",
      description: "O vídeo foi removido permanentemente.",
      variant: "destructive"
    });
  };

  const getVideoDetails = (video: VideoType) => {
    const patient = patients.find(p => p.id === video.patient_id);
    const clinic = patient ? clinics.find(c => c.id === patient.clinic_id) : null;
    
    return {
      patient: patient?.name || 'Paciente não encontrada',
      clinic: clinic?.name || 'Clínica não encontrada',
      clinicCity: clinic?.city || ''
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Todos os Vídeos</h3>
        <p className="text-gray-600">Visualize e gerencie todos os vídeos enviados pelas clínicas</p>
      </div>

      {videos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-gray-600">Os vídeos enviados pelas clínicas aparecerão aqui</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-cinebaby-purple" />
              Lista de Vídeos ({videos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vídeo</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Clínica</TableHead>
                  <TableHead>Data Upload</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => {
                  const details = getVideoDetails(video);
                  return (
                    <TableRow key={video.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Play className="h-4 w-4 mr-2 text-cinebaby-turquoise" />
                          <div>
                            <p className="font-medium">{video.file_name}</p>
                            <a 
                              href={video.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-cinebaby-purple hover:underline"
                            >
                              Ver vídeo
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {details.patient}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <p className="font-medium">{details.clinic}</p>
                            {details.clinicCity && (
                              <p className="text-sm text-gray-500">{details.clinicCity}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(video.uploaded_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVideo(video.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideosTab;
