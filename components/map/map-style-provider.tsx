"use client"

export function MapStyleProvider() {
  return (
    <style jsx global>{`
        .leaflet-container {
          background: #000;
          font-family: 'Inter', sans-serif;
        }
        
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9);
          color: #e0e0e0;
          border-radius: 0;
          border: 1px solid rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3), inset 0 0 10px rgba(6, 182, 212, 0.1);
          overflow: visible !important;
        }
        
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.5);
        }
        
        .leaflet-popup-close-button {
          color: rgba(6, 182, 212, 0.8) !important;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          margin-right: 15px !important;
          margin-bottom: 15px !important;
        }
        
        .leaflet-control-zoom a {
          background-color: rgba(0, 0, 0, 0.7) !important;
          color: rgba(6, 182, 212, 0.8) !important;
          border: 1px solid rgba(6, 182, 212, 0.5) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          font-weight: bold !important;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: rgba(6, 182, 212, 0.2) !important;
          color: rgba(6, 182, 212, 1) !important;
        }
        
        .cyberpunk-popup .leaflet-popup-content {
          margin: 0;
          overflow: visible !important;
          position: relative;
          z-index: 99999999;
        }
        
        .cyberpunk-popup {
          overflow: visible !important;
          z-index: 99999999;
        }
        
        /* Mobile-specific improvements */
        @media (max-width: 768px) {
          .leaflet-control-zoom a {
            width: 40px !important;
            height: 40px !important;
            line-height: 40px !important;
            font-size: 20px !important;
          }
          .leaflet-popup-content-wrapper {
            max-width: 90vw;
            font-size: 14px;
          }
        }
      `}</style>
  )
} 