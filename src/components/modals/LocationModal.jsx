import React, { useState, useEffect, useRef } from 'react';
import * as userApi from '../../api/userApi';

const LocationModal = ({ isOpen, onClose, currentLocation, coords, onSetLocation }) => {
  const [selectedAddress, setSelectedAddress] = useState(currentLocation);
  const [selectedCoords, setSelectedCoords] = useState(coords);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const storeMarkers = useRef([]);

  useEffect(() => {
    if (!isOpen) return;

    // Wait for modal transition
    const timer = setTimeout(() => {
      const { kakao } = window;
      if (kakao && kakao.maps) {
        kakao.maps.load(() => {
          const container = mapRef.current;
          if (!container) return;

          const initialCenter = new kakao.maps.LatLng(coords.lat, coords.lon);
          const options = {
            center: initialCenter,
            level: 3,
          };

          const map = new kakao.maps.Map(container, options);
          mapInstance.current = map;

          const marker = new kakao.maps.Marker({
            position: initialCenter,
          });
          marker.setMap(map);
          markerInstance.current = marker;

          const geocoder = new kakao.maps.services.Geocoder();

          // Function to fetch and draw stores
          const updateStoreMarkers = async (lat, lon) => {
            try {
              const res = await userApi.getNearbyStores({ latitude: lat, longitude: lon, size: 50 });
              const stores = res.content || [];

              // Remove old markers
              storeMarkers.current.forEach(m => m.setMap(null));
              storeMarkers.current = [];

              // Add new markers
              stores.forEach(s => {
                if (s.latitude && s.longitude) {
                  const sPos = new kakao.maps.LatLng(s.latitude, s.longitude);
                  const sMarker = new kakao.maps.Marker({
                    position: sPos,
                    image: new kakao.maps.MarkerImage(
                      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                      new kakao.maps.Size(24, 35)
                    )
                  });
                  sMarker.setMap(map);

                  // Optional: Add info window on click
                  const infowindow = new kakao.maps.InfoWindow({
                    content: `<div style="padding:5px;font-size:12px;font-weight:700;">${s.storeName}</div>`
                  });

                  kakao.maps.event.addListener(sMarker, 'mouseover', () => infowindow.open(map, sMarker));
                  kakao.maps.event.addListener(sMarker, 'mouseout', () => infowindow.close());

                  storeMarkers.current.push(sMarker);
                }
              });
            } catch (err) {
              console.error("Failed to fetch stores for map:", err);
            }
          };

          // Initial fetch for stores
          updateStoreMarkers(coords.lat, coords.lon);

          kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
            const latlng = mouseEvent.latLng;
            marker.setPosition(latlng);

            const newLat = latlng.getLat();
            const newLon = latlng.getLng();
            setSelectedCoords({ lat: newLat, lon: newLon });

            // Update stores near new center
            updateStoreMarkers(newLat, newLon);

            geocoder.coord2Address(newLon, newLat, (result, status) => {
              if (status === kakao.maps.services.Status.OK) {
                const addr = result[0].address.address_name;
                setSelectedAddress(addr);
              }
            });
          });
        });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, coords]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', width: '90%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', height: '80vh'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#111' }}>주소 설정</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {/* Range Notice */}
        <div style={{ padding: '12px 24px', backgroundColor: '#f0fdf4', borderBottom: '1px solid #dcfce7', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>ℹ️</span>
          <span>반경 3km 내의 가게 상품만 주문이 가능합니다.</span>
        </div>

        {/* Map Area */}
        <div style={{ flexGrow: 1, position: 'relative', backgroundColor: '#f4f4f4', overflow: 'hidden' }}>
          <div
            ref={mapRef}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />

          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 16px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '12px',
            fontWeight: '700',
            color: 'var(--primary)',
            whiteSpace: 'nowrap'
          }}>
            📍 지도를 클릭하여 핀을 이동해보세요
          </div>
        </div>

        {/* Footer Action */}
        <div style={{ padding: '24px', backgroundColor: 'white', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '800', marginBottom: '6px' }}>설정하려는 주소가 맞나요?</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>{selectedAddress}</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>위의 주소 근처 마트들이 검색됩니다.</div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '16px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}
            >
              취소
            </button>
            <button
              onClick={() => { onSetLocation(selectedAddress, selectedCoords); onClose(); }}
              style={{ flex: 2, padding: '16px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}
            >
              이 위치로 주소 설정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
