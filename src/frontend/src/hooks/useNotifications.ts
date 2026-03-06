import { useEffect, useState } from "react";
import type { Booking } from "../backend.d";
import { BookingStatus } from "../backend.d";

export type AppNotification = {
  id: string; // `${bookingId}-${status}`
  bookingId: number;
  message: string;
  status: string;
  timestamp: number;
  read: boolean;
};

type StoredNotifications = {
  notifications: AppNotification[];
  seenStatuses: Record<string, string>; // bookingId -> last seen status
};

function getNotificationMessage(bookingId: number, status: string): string {
  switch (status) {
    case BookingStatus.pending:
      return `Booking #${bookingId} has been placed and is pending confirmation`;
    case BookingStatus.confirmed:
      return `Booking #${bookingId} has been confirmed and a technician is assigned`;
    case BookingStatus.inProgress:
      return `Booking #${bookingId} is now in progress`;
    case BookingStatus.completed:
      return `Booking #${bookingId} has been completed`;
    case BookingStatus.cancelled:
      return `Booking #${bookingId} has been cancelled`;
    default:
      return `Booking #${bookingId} status updated to ${status}`;
  }
}

function loadFromStorage(principal: string): StoredNotifications {
  try {
    const raw = localStorage.getItem(`lepzo_notifications_${principal}`);
    if (raw) {
      return JSON.parse(raw) as StoredNotifications;
    }
  } catch {
    // ignore parse errors
  }
  return { notifications: [], seenStatuses: {} };
}

function saveToStorage(principal: string, data: StoredNotifications): void {
  try {
    localStorage.setItem(
      `lepzo_notifications_${principal}`,
      JSON.stringify(data),
    );
  } catch {
    // ignore storage errors
  }
}

export function useNotifications(
  principal: string | undefined,
  bookings: Booking[] | undefined,
) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load notifications from storage on mount / principal change
  useEffect(() => {
    if (!principal) {
      setNotifications([]);
      return;
    }
    const stored = loadFromStorage(principal);
    setNotifications(stored.notifications);
  }, [principal]);

  // Sync notifications when bookings change
  useEffect(() => {
    if (!principal || !bookings) return;

    const stored = loadFromStorage(principal);
    const currentSeenStatuses = { ...stored.seenStatuses };
    const existingNotifications = [...stored.notifications];
    let hasChanges = false;

    for (const booking of bookings) {
      const bookingId = Number(booking.id);
      const currentStatus = booking.status as string;
      const previousStatus = currentSeenStatuses[String(bookingId)];

      if (previousStatus !== currentStatus) {
        // Status changed — create a notification
        const notifId = `${bookingId}-${currentStatus}`;
        const alreadyExists = existingNotifications.some(
          (n) => n.id === notifId,
        );

        if (!alreadyExists) {
          existingNotifications.unshift({
            id: notifId,
            bookingId,
            message: getNotificationMessage(bookingId, currentStatus),
            status: currentStatus,
            timestamp: Date.now(),
            read: false,
          });
          hasChanges = true;
        }
        currentSeenStatuses[String(bookingId)] = currentStatus;
        if (previousStatus === undefined) {
          // First time seeing this booking — mark it as read to avoid noise
          const idx = existingNotifications.findIndex((n) => n.id === notifId);
          if (idx !== -1) {
            existingNotifications[idx] = {
              ...existingNotifications[idx],
              read: true,
            };
          }
        }
      }
    }

    if (hasChanges) {
      const updated: StoredNotifications = {
        notifications: existingNotifications.slice(0, 50), // keep at most 50
        seenStatuses: currentSeenStatuses,
      };
      saveToStorage(principal, updated);
      setNotifications(updated.notifications);
    } else {
      // Still update seenStatuses for new bookings
      const updated: StoredNotifications = {
        notifications: existingNotifications,
        seenStatuses: currentSeenStatuses,
      };
      saveToStorage(principal, updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principal, bookings]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    if (!principal) return;
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    const stored = loadFromStorage(principal);
    saveToStorage(principal, { ...stored, notifications: updated });
  };

  return { notifications, unreadCount, markAllRead };
}
