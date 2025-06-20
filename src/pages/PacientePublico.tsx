
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Heart, X, Smartphone, ArrowLeft } from 'lucide-react';
import { Patient, Video } from '@/types';

const PacientePublico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PacientePublico - Patient UUID from URL:', id);
    
    // Verificar se o ID da URL é um UUID válido
    if (id) {
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      if (!isValidUUID) {
        console.log('PacientePublico - Invalid UUID format:', id);
        setError('ID da paciente inválido');
        setLoading(false);
        return;
      }
      
      loadPatientAndVideos();
    } else {
      setError('ID da paciente não fornecido');
      setLoading(false);
    }
  }, [id]);

  const loadPatientAndVideos = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // TODO: Substituir por consulta real ao Supabase quando integrado
      // const { data: paciente, error: patientError } = await supabase
      //   .from("pacientes")
      //   .select("*")
      //   .eq("id", id)
      //   .single();
      
      // Por enquanto, buscar no localStorage como fallback
      const patients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
      console.log('PacientePublico - Searching for patient with UUID:', id);
      
      // Buscar paciente pelo UUID exato
      const foundPatient = patients.find((p: Patient) => p.id === id);
      
      if (foundPatient) {
        console.log('PacientePublico - Patient found:', foundPatient);
        setPatient(foundPatient);
        
        // Carregar vídeos da paciente
        await loadVideos(id);
      } else {
        console.log('PacientePublico - Patient not found with UUID:', id);
        console.log('PacientePublico - Available patients:', patients.map(p => ({ id: p.id, name: p.name })));
        setError('Paciente não encontrada');
      }
    } catch (error) {
      console.error('PacientePublico - Error loading patient:', error);
      setError('Erro ao carregar dados da paciente');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (patientId: string) => {
    try {
      // TODO: Substituir por consulta real ao Supabase quando integrado
      // const { data: videos, error: videosError } = await supabase
      //   .from("videos")
      //   .select("*")
      //   .eq("patient_id", patientId);
      
      // Por enquanto, buscar no localStorage e IndexedDB como fallback
      const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
      const patientVideos = allVideos.filter((v: Video) => v.patientId === patientId);
      
      console.log('PacientePublico - Videos found for patient:', patientVideos.length);
      setVideos(patientVideos);
    } catch (error) {
      console.error('PacientePublico - Error loading videos:', error);
    }
  };

  const handlePlayVideo = (video: Video) => {
    console.log('PacientePublico - Playing video:', video.fileName);
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 to-cinebaby-teal/5 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-cinebaby-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Heart className="h-8 w-8 text-cinebaby-purple" />
            </div>
            <p className="text-sm text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 to-cinebaby-teal/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              QR Code Inválido
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Este QR Code não é válido ou expirou. Por favor, entre em contato com sua clínica.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/')}
                className="w-full bg-cinebaby-gradient hover:opacity-90"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à página inicial
              </Button>
              <p className="text-xs text-gray-500 font-mono">ID: {id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 to-cinebaby-teal/5">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="text-center">
            <img 
              src="/lovable-uploads/6bd58522-32f8-48b7-bbe7-999d3463508c.png" 
              alt="CineBaby" 
              className="h-8 sm:h-12 mx-auto mb-3 sm:mb-4"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-cinebaby-purple mb-1 sm:mb-2">
              Vídeos de {patient.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-2">
              "Reviva esse momento mágico sempre que quiser"
            </p>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
              <Smartphone className="h-3 w-3 mr-1" />
              Paciente UUID: {patient.id}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Card className="shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-center text-lg sm:text-xl">
              Seus Vídeos de Ultrassom ({videos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {videos.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cinebaby-purple/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Play className="h-6 w-6 sm:h-8 sm:w-8 text-cinebaby-purple" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Ainda não há vídeos disponíveis
                </h3>
                <p className="text-sm sm:text-base text-gray-600 px-4 mb-2">
                  Os vídeos do seu ultrassom aparecerão aqui em breve.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                {videos.map((video) => (
                  <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-white to-gray-50" onClick={() => handlePlayVideo(video)}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="aspect-video bg-gradient-to-br from-cinebaby-purple/10 to-cinebaby-teal/10 rounded-lg mb-3 sm:mb-4 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-2 sm:p-3">
                            <Play className="h-6 w-6 sm:h-8 sm:w-8 text-cinebaby-purple" />
                          </div>
                        </div>
                        <Play className="h-8 w-8 sm:h-12 sm:w-12 text-cinebaby-purple" />
                      </div>
                      <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base text-center">
                        Vídeo do Ultrassom
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 text-center">
                        {formatDate(video.uploadedAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-sm mx-1 sm:mx-0">
          <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
            "Ver seu bebê antes do nascimento é um carinho que emociona para sempre."
          </p>
          <p className="text-xs text-gray-500 mt-2">
            CineBaby - Momentos que ficam para sempre
          </p>
        </div>
      </div>

      {/* Video Player Dialog */}
      <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] p-3 sm:p-6">
          <DialogHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm sm:text-lg">Vídeo do Ultrassom</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVideoPlayerOpen(false)}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedVideo && formatDate(selectedVideo.uploadedAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {selectedVideo.fileUrl ? (
                <video 
                  src={selectedVideo.fileUrl} 
                  controls 
                  autoPlay
                  className="w-full h-full"
                  preload="metadata"
                  playsInline
                >
                  Seu navegador não suporta a reprodução de vídeo.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Play className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Vídeo indisponível</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PacientePublico;
