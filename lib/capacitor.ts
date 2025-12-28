/**
 * Capacitor native integration utilities
 * Provides unified interface for push notifications, calendar, and platform detection
 */

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { CapacitorCalendar } from '@ebarooni/capacitor-calendar';

// ============================================================================
// Platform Detection
// ============================================================================

export const isNative = () => Capacitor.isNativePlatform();
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isWeb = () => Capacitor.getPlatform() === 'web';

// ============================================================================
// Push Notifications
// ============================================================================

export interface PushNotificationState {
  registered: boolean;
  token: string | null;
  error: string | null;
}

let pushState: PushNotificationState = {
  registered: false,
  token: null,
  error: null,
};

/**
 * Initialize push notifications
 * Call this early in app lifecycle (e.g., in root layout useEffect)
 */
export async function initPushNotifications(): Promise<PushNotificationState> {
  if (!isNative()) {
    return pushState;
  }

  try {
    // Check/request permission
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      pushState.error = 'Push notification permission denied';
      return pushState;
    }

    // Register with APNs
    await PushNotifications.register();

    // Listen for registration success
    PushNotifications.addListener('registration', (token) => {
      pushState.registered = true;
      pushState.token = token.value;
      console.log('Push registration success:', token.value);

      // TODO: Send token to your backend
      // registerDeviceToken(token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      pushState.error = error.error;
      console.error('Push registration failed:', error.error);
    });

    // Listen for incoming notifications (foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
      // Handle foreground notification display
    });

    // Listen for notification tap
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push action:', action);
      // Handle deep linking based on notification data
      // const data = action.notification.data;
      // if (data.providerId) router.push(`/provider/${data.providerId}`);
    });

  } catch (error) {
    pushState.error = String(error);
    console.error('Push init error:', error);
  }

  return pushState;
}

export function getPushState(): PushNotificationState {
  return pushState;
}

// ============================================================================
// Calendar Integration
// ============================================================================

export interface CalendarEventOptions {
  title: string;
  notes?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
}

/**
 * Check if calendar permission is granted
 */
export async function hasCalendarPermission(): Promise<boolean> {
  if (!isNative()) return false;

  try {
    const { result } = await CapacitorCalendar.checkAllPermissions();
    return result.writeCalendar === 'granted';
  } catch {
    return false;
  }
}

/**
 * Request calendar permission
 */
export async function requestCalendarPermission(): Promise<boolean> {
  if (!isNative()) return false;

  try {
    const { result } = await CapacitorCalendar.requestAllPermissions();
    return result.writeCalendar === 'granted';
  } catch {
    return false;
  }
}

/**
 * Add an event to the device calendar
 * Opens native calendar UI for user confirmation
 */
export async function addCalendarEvent(options: CalendarEventOptions): Promise<boolean> {
  if (!isNative()) {
    // Fallback: generate .ics file or Google Calendar link for web
    const googleUrl = generateGoogleCalendarUrl(options);
    window.open(googleUrl, '_blank');
    return true;
  }

  try {
    // Check permission
    const hasPermission = await hasCalendarPermission();
    if (!hasPermission) {
      const granted = await requestCalendarPermission();
      if (!granted) {
        console.error('Calendar permission denied');
        return false;
      }
    }

    // Use native prompt to let user confirm/edit the event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await CapacitorCalendar.createEventWithPrompt({
      title: options.title,
      location: options.location,
      startDate: options.startDate.getTime(),
      endDate: options.endDate?.getTime() || options.startDate.getTime() + 3600000, // Default 1 hour
      isAllDay: options.allDay ?? false,
    } as any);

    return true;
  } catch (error) {
    console.error('Failed to add calendar event:', error);
    return false;
  }
}

/**
 * Add a provider appointment to calendar
 */
export async function addProviderAppointment(
  providerName: string,
  providerAddress: string | undefined,
  appointmentDate: Date
): Promise<boolean> {
  return addCalendarEvent({
    title: `Appointment: ${providerName}`,
    location: providerAddress,
    startDate: appointmentDate,
    notes: 'Added from ParentGlue',
  });
}

/**
 * Add a milestone/reminder to calendar
 */
export async function addMilestoneReminder(
  title: string,
  dueDate: Date,
  notes?: string
): Promise<boolean> {
  return addCalendarEvent({
    title,
    startDate: dueDate,
    allDay: true,
    notes: notes || 'Reminder from ParentGlue',
  });
}

// ============================================================================
// Helpers
// ============================================================================

function generateGoogleCalendarUrl(options: CalendarEventOptions): string {
  const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: options.title,
    dates: `${formatDate(options.startDate)}/${formatDate(options.endDate || new Date(options.startDate.getTime() + 3600000))}`,
    details: options.notes || '',
    location: options.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}
