import { logger } from '../services/logger';

export interface StreamSubscriber<T> {
  next: (value: T) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
}

/**
 * Subscribe to a server-sent events endpoint emitting JSON messages.
 * Returns an unsubscribe function that closes the connection.
 */
export function subscribeJsonStream<T>(
  url: string,
  subscriber: StreamSubscriber<T>,
  label = 'SSE',
): () => void {
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      subscriber.next(JSON.parse(event.data) as T);
    } catch (e) {
      logger.error(`Failed to parse ${label} message`, e);
    }
  };

  eventSource.onerror = (error) => {
    logger.error(`${label} error`, error);
    // EventSource auto-reconnects by default; only give up when the
    // connection is permanently closed by the server.
    if (eventSource.readyState === EventSource.CLOSED) {
      subscriber.complete?.();
    } else {
      subscriber.error?.(error);
    }
  };

  return () => eventSource.close();
}

/**
 * Subscribe to a server-sent events endpoint emitting raw text lines
 * (e.g. log streaming). Completes silently on error, like the legacy app.
 */
export function subscribeTextStream(
  url: string,
  subscriber: StreamSubscriber<string>,
): () => void {
  const eventSource = new EventSource(url);
  eventSource.onmessage = (event) => subscriber.next(event.data);
  eventSource.onerror = () => {
    eventSource.close();
    subscriber.complete?.();
  };
  return () => eventSource.close();
}
