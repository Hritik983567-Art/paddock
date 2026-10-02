import { describe, it, expect } from 'vitest';
import { getDriverMediaProfile } from '../app/lib/driverMediaService';

describe('DriverMediaService Transfer Engine & Era-Specific Team Suits', () => {
  it('should assign Lewis Hamilton to Ferrari for 2025/2026 with Ferrari headshot', () => {
    const profile2025 = getDriverMediaProfile('hamilton', '2025');
    expect(profile2025.teamId).toBe('ferrari');
    expect(profile2025.teamName).toBe('Scuderia Ferrari HP');
    expect(profile2025.isTransferred).toBe(true);
    expect(profile2025.headshotUrl).toContain('LEWHAM01');
  });

  it('should assign Lewis Hamilton to Mercedes for 2024 season with Mercedes race suit photo', () => {
    const profile2024 = getDriverMediaProfile('hamilton', '2024');
    expect(profile2024.teamId).toBe('mercedes');
    expect(profile2024.teamName).toBe('Mercedes-AMG PETRONAS F1 Team');
    expect(profile2024.headshotUrl).toContain('LEWHAM01');
  });

  it('should assign Lewis Hamilton to McLaren for 2008 season with McLaren race suit photo', () => {
    const profile2008 = getDriverMediaProfile('hamilton', '2008');
    expect(profile2008.teamId).toBe('mclaren');
    expect(profile2008.teamName).toBe('McLaren F1 Team');
    expect(profile2008.headshotUrl).toContain('Lewis_Hamilton_2008');
  });

  it('should assign Carlos Sainz to Williams for 2025/2026', () => {
    const profile = getDriverMediaProfile('sainz', '2025');
    expect(profile.teamId).toBe('williams');
    expect(profile.teamName).toBe('Williams Racing');
  });

  it('should assign Carlos Sainz to Ferrari for 2022 season with Ferrari red suit photo', () => {
    const profile2022 = getDriverMediaProfile('sainz', '2022');
    expect(profile2022.teamId).toBe('ferrari');
    expect(profile2022.headshotUrl).toBeTruthy();
    expect(profile2022.headshotUrl).toContain('CARSAI01');
  });

  it('should assign Sebastian Vettel to Red Bull for 2012 season with Red Bull navy suit photo', () => {
    const profile2012 = getDriverMediaProfile('vettel', '2012');
    expect(profile2012.teamId).toBe('red_bull');
    expect(profile2012.headshotUrl).toBeTruthy();
    expect(profile2012.headshotUrl).toContain('Vettel');
  });
});
