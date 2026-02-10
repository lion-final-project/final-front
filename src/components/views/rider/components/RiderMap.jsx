import React, { useEffect, useRef } from 'react';

const RiderMap = ({ location, height = '200px' }) => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const infoWindowInstance = useRef(null);

    useEffect(() => {
        const initializeMap = () => {
            if (!window.kakao || !window.kakao.maps) return false;

            const { kakao } = window;
            const container = mapContainer.current;
            if (!container) return false;

            const lat = location?.latitude || 37.5663;
            const lng = location?.longitude || 126.9779;
            const center = new kakao.maps.LatLng(lat, lng);

            const options = {
                center: center,
                level: 3,
                draggable: true,
            };

            const map = new kakao.maps.Map(container, options);
            mapInstance.current = map;

            // 마커 생성
            const marker = new kakao.maps.Marker({
                position: center,
                map: map
            });
            markerInstance.current = marker;

            // 인포윈도우 생성 (좌표 표시용)
            const iwContent = `<div style="padding:5px; font-size:12px; color:#0f172a; font-weight:700; text-align:center;">내 위치</div>`;
            const iwRemoveable = false;
            const infowindow = new kakao.maps.InfoWindow({
                content: iwContent,
                removable: iwRemoveable
            });
            infowindow.open(map, marker);
            infoWindowInstance.current = infowindow;

            return true;
        };

        if (!initializeMap()) {
            const timer = setInterval(() => {
                if (initializeMap()) clearInterval(timer);
            }, 500);
            return () => clearInterval(timer);
        }

        const handleResize = () => {
            if (mapInstance.current) {
                mapInstance.current.relayout();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 위치 업데이트 시 마커, 인포윈도우 및 중심 이동
    useEffect(() => {
        if (mapInstance.current && markerInstance.current && location) {
            const { kakao } = window;
            const moveLatLon = new kakao.maps.LatLng(location.latitude, location.longitude);

            markerInstance.current.setPosition(moveLatLon);

            if (infoWindowInstance.current) {
                const content = `<div style="padding:8px; font-size:11px; color:#0f172a; line-height:1.4;">
                    <div style="font-weight:900; color:#38bdf8; margin-bottom:2px;">실시간 내 위치</div>
                    <div style="font-family:monospace;">${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}</div>
                </div>`;
                infoWindowInstance.current.setContent(content);
                infoWindowInstance.current.open(mapInstance.current, markerInstance.current);
            }

            mapInstance.current.setCenter(moveLatLon); // panTo 대신 확실한 setCenter 사용
        }
    }, [location]);

    return (
        <div
            ref={mapContainer}
            style={{
                width: '100%',
                height: height,
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #334155'
            }}
        />
    );
};

export default RiderMap;
