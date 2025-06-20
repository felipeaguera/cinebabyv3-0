
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Video, Play, Calendar, User, Trash2 } from 'lucide-react';
import { Patient, Video as VideoType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface ClinicExamsTabProps {
  videos: VideoType[];
  setVideos: (videos: VideoType[]) => void;
  patients: Patient[];
  clinicId: string;
}

const ClinicExamsTab: React.FC<ClinicExamsTabProps> = ({ videos, setVideos, patients, clinicId }) => {
  const { toast } = useToast();

  // Filtrar vídeos apenas da clínica atual
  const clinicVideos = videos.filter(video => {
    const patient = patients.find(p => p.id === video.patientId);
    return patient?.clinicId === clinicId;
  });

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

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Paciente não encontrada';
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
        <h3 className="text-xl font-semibold text-gray-900">Exames Realizados</h3>
        <p className="text-gray-600">Visualize todos os vídeos de ultrassom enviados pela sua clínica</p>
      </div>

      {clinicVideos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exame encontrado</h3>
            <p className="text-gray-600">Os vídeos de ultrassom que você enviar aparecerão aqui</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-cinebaby-purple" />
              Exames Realizados ({clinicVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vídeo</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Data do Exame</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Play className="h-4 w-4 mr-2 text-cinebaby-turquoise" />
                        <div>
                          <p className="font-medium">{video.fileName}</p>
                          <a 
                            href={video.fileUrl} 
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
                        {getPatientName(video.patientId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(video.uploadedAt)}
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClinicExamsTab;
