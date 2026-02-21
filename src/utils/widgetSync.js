import { registerPlugin, Capacitor } from '@capacitor/core';
import { getUpcomingClasses, SUBJECT_COLORS } from '../data/scheduleData';

const WidgetSync = registerPlugin('WidgetSync');

/**
 * Synchronize today's schedule with the native Android widget.
 * @param {number} selectedGroup - The student group (1, 2, or 3).
 */
export async function syncScheduleWithWidget(selectedGroup = 1) {
    if (Capacitor.getPlatform() !== 'android') return;

    try {
        // We use getUpcomingClasses to get today's classes
        // (the function was modified to return all current day's classes in previous conversations)
        const upcomingClasses = getUpcomingClasses(selectedGroup, 6);

        const scheduleData = upcomingClasses.map(cls => ({
            subject: cls.subject,
            time: cls.time,
            room: cls.room,
            color: SUBJECT_COLORS[cls.subject] || '#6b7280'
        }));

        await WidgetSync.syncSchedule({
            schedule: JSON.stringify(scheduleData),
            group: `G-${selectedGroup}`
        });

        console.log('Schedule synced with widget successfully');
    } catch (error) {
        console.error('Failed to sync schedule with widget:', error);
    }
}
