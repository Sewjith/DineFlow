import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../api/client';

/**
 * Subscribes to live "order:changed" events from order-service's Socket.IO server and invokes
 * `onChange` whenever an order is placed or its status changes. Connects same-origin (proxied
 * to the socket server) and authenticates with the current admin token. No-ops when logged out.
 */
export default function useOrderEvents(onChange) {
  const savedOnChange = useRef(onChange);
  savedOnChange.current = onChange;

  useEffect(() => {
    const token = getToken();
    if (!token) return undefined;

    // Same origin; Vite (dev) and nginx (prod) proxy /socket.io to order-service.
    const socket = io({ path: '/socket.io', query: { token } });
    socket.on('order:changed', () => savedOnChange.current?.());

    return () => socket.disconnect();
  }, []);
}
