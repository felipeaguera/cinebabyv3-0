
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Download } from 'lucide-react';
import { Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface QRCodeViewerProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeViewer: React.FC<QRCodeViewerProps> = ({ patient, isOpen, onClose }) => {
  const { toast } = useToast();

  if (!patient) return null;

  // Garantir que o link seja sempre correto
  const baseUrl = window.location.origin;
  const patientVideoUrl = `${baseUrl}/patient/${patient.id}/videos`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(patientVideoUrl)}`;

  console.log('QRCodeViewer - Generated URL for patient videos:', patientVideoUrl);
  console.log('QRCodeViewer - QR Code URL:', qrCodeUrl);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(patientVideoUrl);
    toast({
      title: "Link copiado!",
      description: "O link dos vídeos foi copiado para a área de transferência.",
    });
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${patient.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code baixado!",
      description: "O QR Code foi baixado com sucesso.",
    });
  };

  const handleTestLink = () => {
    window.open(patientVideoUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-cinebaby-purple" />
            QR Code - {patient.name}
          </DialogTitle>
          <DialogDescription>
            Use este QR Code para acessar os vídeos da paciente no celular
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <img 
                src={qrCodeUrl} 
                alt={`QR Code para ${patient.name}`}
                className="w-72 h-72"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=';
                }}
              />
            </div>
          </div>

          {/* Patient Info */}
          <div className="text-center space-y-2">
            <h3 className="font-medium text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-600">{patient.phone}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadQR}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar QR
            </Button>
          </div>

          {/* Test Button */}
          <Button
            onClick={handleTestLink}
            className="w-full bg-cinebaby-gradient hover:opacity-90"
          >
            Testar Link
          </Button>

          {/* Link Display */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Link dos vídeos:</p>
            <p className="text-sm font-mono text-gray-800 break-all">{patientVideoUrl}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeViewer;
