/**
 * TrailScribe Wilderness Solar Ephemeris & Dusk Countdown Engine
 * Calculates accurate solar position, remaining daylight, sunset, and civil dusk
 * to prevent disoriented hiker emergencies and support Search & Rescue (SAR) safety.
 */

export interface DaylightEphemeris {
  sunsetDate: Date;
  sunsetTimeString: string;
  civilDuskDate: Date;
  civilDuskTimeString: string;
  remainingMinutes: number;
  remainingHoursText: string;
  daylightElapsedPercent: number;
  sunPhase: 'daylight' | 'golden_hour' | 'civil_twilight' | 'night';
  isUrgentAlert: boolean; // true if daylight remaining < 45 minutes
  alertMessage: string;
  statusBadge: string;
  iconName: string;
}

export class SolarEphemerisCalculator {
  /**
   * Calculates sunset and civil twilight based on geographic coordinates and timestamp.
   * Uses standard NOAA solar positioning algorithms (100% offline, zero network latency).
   */
  static calculate(
    latitude: number = 19.0438,
    longitude: number = 73.0674,
    currentTime: Date = new Date()
  ): DaylightEphemeris {
    const lat = isNaN(latitude) || latitude === 0 ? 19.0438 : latitude;
    const lon = isNaN(longitude) || longitude === 0 ? 73.0674 : longitude;

    // Day of the year
    const startOfYear = new Date(currentTime.getFullYear(), 0, 0);
    const diff = currentTime.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Fractional year in radians
    const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (currentTime.getHours() - 12) / 24);

    // Equation of time in minutes
    const eqTime = 229.18 * (
      0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)
    );

    // Solar declination angle in radians
    const decl = 0.006918 -
      0.399912 * Math.cos(gamma) +
      0.070257 * Math.sin(gamma) -
      0.006758 * Math.cos(2 * gamma) +
      0.000907 * Math.sin(2 * gamma) -
      0.002697 * Math.cos(3 * gamma) +
      0.00148 * Math.sin(3 * gamma);

    const latRad = (lat * Math.PI) / 180;

    // Calculate sunset for standard zenith = 90.833° (atmospheric refraction accounted)
    const zenithSunset = (90.833 * Math.PI) / 180;
    const cosHourAngleSunset = (Math.cos(zenithSunset) - (Math.sin(latRad) * Math.sin(decl))) / (Math.cos(latRad) * Math.cos(decl));
    const clampedCosSunset = Math.max(-1, Math.min(1, cosHourAngleSunset));
    const hourAngleSunset = Math.acos(clampedCosSunset); // in radians

    // Calculate civil twilight for zenith = 96.0°
    const zenithTwilight = (96.0 * Math.PI) / 180;
    const cosHourAngleTwilight = (Math.cos(zenithTwilight) - (Math.sin(latRad) * Math.sin(decl))) / (Math.cos(latRad) * Math.cos(decl));
    const clampedCosTwilight = Math.max(-1, Math.min(1, cosHourAngleTwilight));
    const hourAngleTwilight = Math.acos(clampedCosTwilight);

    // Sunset time calculation in UTC minutes from midnight
    const timezoneOffsetMinutes = -currentTime.getTimezoneOffset(); // e.g. +330 for IST
    const sunsetMinutesUtc = 720 - 4 * lon - eqTime + (hourAngleSunset * 180 / Math.PI) * 4;
    const twilightMinutesUtc = 720 - 4 * lon - eqTime + (hourAngleTwilight * 180 / Math.PI) * 4;

    const sunsetLocalMinutes = (sunsetMinutesUtc + timezoneOffsetMinutes + 1440) % 1440;
    const twilightLocalMinutes = (twilightMinutesUtc + timezoneOffsetMinutes + 1440) % 1440;

    // Convert into Date objects on current day
    const sunsetDate = new Date(currentTime);
    sunsetDate.setHours(Math.floor(sunsetLocalMinutes / 60), Math.floor(sunsetLocalMinutes % 60), 0, 0);

    const civilDuskDate = new Date(currentTime);
    civilDuskDate.setHours(Math.floor(twilightLocalMinutes / 60), Math.floor(twilightLocalMinutes % 60), 0, 0);

    // Calculate remaining minutes from current time
    const currentLocalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const remainingMinutes = Math.round((sunsetDate.getTime() - currentTime.getTime()) / (1000 * 60));

    // Determine Sun Phase
    let sunPhase: 'daylight' | 'golden_hour' | 'civil_twilight' | 'night' = 'daylight';
    let isUrgentAlert = false;
    let alertMessage = '';
    let statusBadge = '';
    let iconName = 'wb_sunny';

    if (remainingMinutes > 60) {
      sunPhase = 'daylight';
      statusBadge = 'Broad Daylight';
      iconName = 'wb_sunny';
      alertMessage = 'Optimal visibility across open and canopied trail sections.';
    } else if (remainingMinutes > 0 && remainingMinutes <= 60) {
      sunPhase = 'golden_hour';
      statusBadge = 'Golden Hour · Prepare Headlamp';
      iconName = 'wb_twilight';
      isUrgentAlert = remainingMinutes <= 45;
      alertMessage = isUrgentAlert
        ? 'DUSK PROXIMITY ALERT: Under 45 min daylight remaining. Reverse course back to trailhead or arm flashlight.'
        : 'Low sun angle creates deep trail shadows. Stay vigilant on rocky footing.';
    } else if (currentTime.getTime() <= civilDuskDate.getTime()) {
      sunPhase = 'civil_twilight';
      statusBadge = 'Civil Twilight (Dusk)';
      iconName = 'routine';
      isUrgentAlert = true;
      alertMessage = 'SUN HAS SET: Ambient sky glow fading rapidly. Switch on headlamps immediately.';
    } else {
      sunPhase = 'night';
      statusBadge = 'True Night';
      iconName = 'nightlight_round';
      isUrgentAlert = true;
      alertMessage = 'NIGHT CONDITIONS: Backcountry travel hazardous without high-lumen illumination.';
    }

    // Daylight elapsed calculation (from sunrise ~06:00 to sunset ~18:30)
    const estimatedSunriseMinutes = (sunsetLocalMinutes - 12 * 60 + 1440) % 1440;
    const totalDaylightMinutes = Math.max(600, (sunsetLocalMinutes - estimatedSunriseMinutes + 1440) % 1440);
    const elapsedDaylightMinutes = Math.max(0, currentLocalMinutes - estimatedSunriseMinutes);
    const daylightElapsedPercent = Math.min(100, Math.max(0, Math.round((elapsedDaylightMinutes / totalDaylightMinutes) * 100)));

    // Formatting text
    const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const remainingHours = Math.floor(Math.abs(remainingMinutes) / 60);
    const remainingMins = Math.abs(remainingMinutes) % 60;
    const remainingHoursText = remainingMinutes >= 0 
      ? `${remainingHours > 0 ? `${remainingHours}h ` : ''}${remainingMins}m`
      : `Past sunset (${remainingMins}m ago)`;

    return {
      sunsetDate,
      sunsetTimeString: formatTime(sunsetDate),
      civilDuskDate,
      civilDuskTimeString: formatTime(civilDuskDate),
      remainingMinutes,
      remainingHoursText,
      daylightElapsedPercent,
      sunPhase,
      isUrgentAlert,
      alertMessage,
      statusBadge,
      iconName
    };
  }
}
