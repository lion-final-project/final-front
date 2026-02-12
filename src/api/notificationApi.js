import api from './axios';

const API_BASE_URL = 'http://localhost:8080';

/**
 * SSE 연결을 통한 실시간 알림 구독
 * @param {Function} onMessage - 메시지 수신 콜백 (eventName, data)
 * @param {Function} onError - 에러 콜백
 * @returns {EventSource} EventSource 인스턴스
 */
export const subscribeNotifications = (onMessage, onError) => {
  // EventSource는 쿠키를 자동으로 전송하지만, 인증이 필요한 경우 쿠키가 있어야 함
  const eventSource = new EventSource(`${API_BASE_URL}/api/notifications/subscribe`, {
    withCredentials: true
  });

  eventSource.onopen = () => {
    console.log('[SSE] 알림 연결 성공');
  };

  eventSource.addEventListener('connected', (event) => {
    console.log('[SSE] 연결 확인:', event.data);
    if (onMessage) {
      onMessage('CONNECTED', event.data);
    }
  });

  eventSource.addEventListener('unread-count', (event) => {
    try {
      // 백엔드에서 전송하는 데이터가 정수이므로 직접 사용
      const data = event.data;
      let count;
      if (typeof data === 'string') {
        count = parseInt(data, 10);
      } else {
        count = data;
      }
      console.log('[SSE] 읽지 않은 알림 개수 수신:', count, '원본 데이터:', data, '타입:', typeof data);
      if (!isNaN(count)) {
        if (onMessage) {
          onMessage('UNREAD_COUNT', count);
        }
      } else {
        console.error('[SSE] UNREAD_COUNT 파싱 실패 - 숫자가 아님:', data);
      }
    } catch (e) {
      console.error('[SSE] UNREAD_COUNT 처리 오류:', e, '원본 데이터:', event.data);
    }
  });

  eventSource.addEventListener('store-order-created', (event) => {
    try {
      const data = event.data;
      const storeOrderId = typeof data === 'string' ? parseInt(data, 10) : data;
      if (onMessage && !isNaN(storeOrderId)) {
        onMessage('STORE_ORDER_CREATED', storeOrderId);
      }
    } catch (e) {
      console.error('[SSE] store-order-created 처리 오류:', e, '원본 데이터:', event.data);
    }
  });

  eventSource.addEventListener('nearby-deliveries', (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[SSE] 주변 배달 알림 수신:', data);
      if (onMessage) {
        onMessage('NEARBY_DELIVERIES', data);
      }
    } catch (e) {
      console.error('[SSE] nearby-deliveries 처리 오류:', e, '원본 데이터:', event.data);
    }
  });

  eventSource.addEventListener('delivery-matched', (event) => {
    try {
      const data = event.data;
      console.log('[SSE] 배차 완료 알림 수신:', data);
      if (onMessage) {
        onMessage('DELIVERY_MATCHED', data);
      }
    } catch (e) {
      console.error('[SSE] delivery-matched 처리 오류:', e, '원본 데이터:', event.data);
    }
  });

  eventSource.addEventListener('delivery-status-changed', (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[SSE] 배달 상태 변경 알림 수신:', data);
      if (onMessage) {
        onMessage('DELIVERY_STATUS_CHANGED', data);
      }
    } catch (e) {
      console.error('[SSE] delivery-status-changed 처리 오류:', e, '원본 데이터:', event.data);
    }
  });

  eventSource.onerror = (error) => {
    console.error('[SSE] 연결 오류:', error);
    console.error('[SSE] EventSource 상태:', eventSource.readyState);
    // readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log('[SSE] 연결이 종료되었습니다.');
    }
    if (onError) {
      onError(error);
    }
  };

  return eventSource;
};

/**
 * 읽지 않은 알림 목록 조회
 */
export const getUnreadNotifications = async () => {
  try {
    const response = await api.get('/api/notifications');
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('알림 조회 오류:', error);
    throw error;
  }
};

/**
 * 모든 알림 읽음 처리
 */
export const markAllAsRead = async () => {
  try {
    await api.patch('/api/notifications/read');
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error);
    throw error;
  }
};

/**
 * 개별 알림 읽음 처리
 * @param {number} notificationId - 알림 ID
 */
export const markAsRead = async (notificationId) => {
  try {
    await api.patch(`/api/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error);
    throw error;
  }
};
