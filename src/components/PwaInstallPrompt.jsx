import { useState, useEffect } from 'react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalado o si es modo standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Manejar evento de instalación en Android / Chrome
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-install-content">
        <div className="pwa-app-icon">♥</div>
        <div className="pwa-text">
          <strong>Solteros Adventistas</strong>
          <span>Instala la app en tu celular para una experiencia rápida a pantalla completa.</span>
        </div>
      </div>

      <div className="pwa-install-actions">
        {isIOS ? (
          <span className="pwa-ios-instructions">
            Pulsa <strong>Compartir (⬆)</strong> y <strong>"Añadir a inicio"</strong>
          </span>
        ) : (
          <button className="primary-btn pwa-install-btn" onClick={handleInstallClick}>
            Instalar App
          </button>
        )}
        <button
          className="pwa-dismiss-btn"
          onClick={() => setShowPrompt(false)}
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
