import dayjs from 'dayjs';
import {
  getExactTime,
  getSoonestFrom,
  isJustBeforeNow,
  isEqual,
} from '../shared/database';
import { AlarmDocType } from '../shared/typings';

describe('Database', () => {
  it('should deliver the precise time', () => {
    const date = new Date(2023, 4, 10, 22, 10, 4, 355);
    expect(date.getMilliseconds()).toEqual(355);
    const result = new Date(getExactTime(date.toISOString()));
    expect(result.getFullYear()).toEqual(2023);
    expect(result.getMonth()).toEqual(4);
    expect(result.getDate()).toEqual(10);
    expect(result.getHours()).toEqual(22);
    expect(result.getMinutes()).toEqual(10);
    expect(result.getSeconds()).toEqual(0);
    expect(result.getMilliseconds()).toEqual(0);
  });

  describe('getSoonestFrom', () => {
    it('should deliver the date at the next minute', () => {
      const base = dayjs(new Date(2023, 1, 10, 22, 30, 5, 555));
      const result = dayjs(getSoonestFrom({ base, unit: 'minute' }));
      expect(result.get('millisecond')).toEqual(0);
      expect(result.get('second')).toEqual(0);
      expect(result.get('minute')).toEqual(31);
    });

    it('should add an hour if the minute is 59', () => {
      const base = dayjs(new Date(2023, 1, 10, 22, 59, 5, 555));
      const result = dayjs(getSoonestFrom({ base, unit: 'minute' }));
      expect(result.get('millisecond')).toEqual(0);
      expect(result.get('second')).toEqual(0);
      expect(result.get('minute')).toEqual(0);
      expect(result.get('hour')).toEqual(base.get('hour') + 1);
    });
  });

  describe('isJustBeforeNow', () => {
    it('should return true when the alarm is active and set to the next minute', () => {
      const datetime = getSoonestFrom();
      const alarm = { active: true, datetime };
      const result = isJustBeforeNow.call(alarm);
      expect(result).toBe(true);
    });
    it('should return true when the alarm is inactive and set to the next minute', () => {
      const datetime = getSoonestFrom();
      const alarm = { active: false, datetime };
      const result = isJustBeforeNow.call(alarm);
      expect(result).toBe(false);
    });
    it('should return true when the alarm is active and set after the next minute', () => {
      const base = dayjs().add(2, 'hour');
      const datetime = getSoonestFrom({ base, unit: 'minute' });
      const alarm = { active: true, datetime };
      const result = isJustBeforeNow.call(alarm);
      expect(result).toBe(false);
    });
  });

  describe('isEqual', () => {
    let base: AlarmDocType;
    let datetime: dayjs.Dayjs;

    beforeEach(() => {
      datetime = dayjs();
      base = {
        datetime: datetime.toISOString(),
        name: 'first alarm',
      };
    });

    it('should return true if both alarms have the same date and name', () => {
      const alarm = {
        datetime: datetime.toISOString(),
        name: 'first alarm',
      };
      expect(isEqual.call(base, alarm)).toBe(true);
    });
    it('should return false otherwise', () => {
      const alarm1 = {
        datetime: datetime.toISOString(),
        name: 'second alarm',
      };
      const alarm2 = {
        datetime: datetime.add(1, 'minute').toISOString(),
        name: 'first alarm',
      };
      const alarm3 = {
        datetime: datetime.add(1, 'minute').toISOString(),
        name: 'second alarm',
      };
      expect(isEqual.call(base, alarm1)).toBe(false);
      expect(isEqual.call(base, alarm2)).toBe(false);
      expect(isEqual.call(base, alarm3)).toBe(false);
    });
  });
});
