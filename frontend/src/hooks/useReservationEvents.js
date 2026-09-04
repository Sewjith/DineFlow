import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../api/client';

/**
 * Subscribes to live "reservation:changed" events from reservation-service's Socket.IO server and
 * invokes `onChange` whenever a reservation is booked, edited or its status changes. Connects
 * same-origin on the /rsocket.io path (proxied to the reservation socket server) and authenticates
 * with the current admin token. No-ops when logged out.
 */
export default function useReservationEvents(onChange) {
  const savedOnChange = useRef(onChange);
  savedOnChange.current = onChange;

  useEffect(() => {
    const token = getToken();
    if (!token) return undefined;

    // Same origin; Vite (dev) and nginx (prod) proxy /rsocket.io to reservation-service.
    const socket = io({ path: '/rsocket.io', query: { token } });
    socket.on('reservation:changed', () => savedOnChange.current?.());

    return () => socket.disconnect();
  }, []);
}
