import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Video, Play, Calendar, User, Trash2, Printer, QrCode } from 'lucide-react';
import { Clinic, Patient, Video as VideoType } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AdminClinicVideosDialogProps {
  clinicId: string;
  clinics: Clinic[];
  patients: Patient[];
  videos: VideoType[];
  setVideos: (videos: VideoType[]) => void;
  onClose: () => void;
}

const AdminClinicVideosDialog: React.FC<AdminClinicVideosDialogProps> = ({
  clinicId,
  clinics,
  patients,
  videos,
  setVideos,
  onClose
}) => {
  const { toast } = useToast();

  const clinic = clinics.find(c => c.id === clinicId);
  const clinicPatients = patients.filter(p => p.clinicId === clinicId);
  const clinicVideos = videos.filter(v => 
    clinicPatients.some(p => p.id === v.patientId)
  );

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) {
      return;
    }

    try {
      // Delete from IndexedDB
      await videoStorage.deleteVideo(videoId);
      
      // Also remove from localStorage as fallback cleanup
      const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
      const updatedVideos = allVideos.filter((v: VideoType) => v.id !== videoId);
      localStorage.setItem('cinebaby_videos', JSON.stringify(updatedVideos));
      setVideos(updatedVideos);

      console.log(`Video ${videoId} permanently deleted from all storage locations`);

      toast({
        title: "Vídeo excluído!",
        description: "O vídeo foi removido permanentemente de todos os locais de armazenamento.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o vídeo completamente. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handlePrintQRCode = (patient: Patient) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(patient.qrCode || `patient-${patient.id}`)}`;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${patient.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .qr-container {
                display: inline-block;
                border: 2px solid #333;
                padding: 20px;
                margin: 10px;
                border-radius: 8px;
              }
              h2 { margin-bottom: 10px; color: #333; }
              p { margin: 5px 0; color: #666; }
              img { margin: 20px 0; }
              .clinic-info { 
                font-size: 14px; 
                color: #888; 
                margin-top: 15px;
                border-top: 1px solid #ddd;
                padding-top: 15px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>${patient.name}</h2>
              <p><strong>Telefone:</strong> ${patient.phone}</p>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <div class="clinic-info">
                <p><strong>Clínica:</strong> ${clinic?.name || ''}</p>
                <p><strong>Cidade:</strong> ${clinic?.city || ''}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "QR Code enviado para impressão!",
      description: `QR Code da paciente ${patient.name} foi preparado para impressão.`,
    });
  };

  const getPatientName = (patientId: string) => {
    const patient = clinicPatients.find(p => p.id === patientId);
    return patient?.name || 'Paciente não encontrada';
  };

  const getPatientById = (patientId: string) => {
    return clinicPatients.find(p => p.id === patientId);
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Video className="h-5 w-5 mr-2 text-cinebaby-purple" />
            Vídeos da Clínica: {clinic?.name}
          </DialogTitle>
          <DialogDescription>
            Visualize e gerencie todos os vídeos enviados por esta clínica ({clinicVideos.length} vídeos)
          </DialogDescription>
        </DialogHeader>

        {clinicVideos.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-gray-600">Esta clínica ainda não enviou nenhum vídeo</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vídeo</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Data Upload</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicVideos.map((video) => {
                  const patient = getPatientById(video.patientId);
                  return (
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
                          <div>
                            <p className="font-medium">{getPatientName(video.patientId)}</p>
                            {patient && (
                              <p className="text-sm text-gray-500">{patient.phone}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(video.uploadedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {patient && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintQRCode(patient)}
                              className="text-cinebaby-turquoise hover:bg-cinebaby-turquoise hover:text-white"
                            >
                              <QrCode className="h-4 w-4 mr-1" />
                              QR Code
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminClinicVideosDialog;
