import dayjs from 'dayjs';
import {
  getExactTime,
  getSoonestFrom,
  isJustBeforeNow,
} from '../shared/database';

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
      const alarm = { id: datetime, active: true, datetime };
      const result = isJustBeforeNow.call(alarm);
      expect(result).toBe(true);
    });
    it('should return true when the alarm is inactive and set to the next minute', () => {
      const datetime = getSoonestFrom();
      const alarm = { id: datetime, active: false, datetime };
      const result = isJustBeforeNow.call(alarm);
      expect(result).toBe(false);
    });
    it('should return true when the alarm is active and set after the next minute', () => {
      const base = dayjs().add(2, 'hour');
      const datetime = getSoonestFrom({ base, unit: 'minute' });
      const alarm = { id: datetime, active: true, datetime };
      const result = isJustBeforeNow.call(alarm);
      expect(result).toBe(false);
    });
  });
});
