import { expect, test, describe, beforeEach } from '@jest/globals';
import { getPin } from '../../fixtures';
import { MemoryStorage } from '../../../src/storage';
import { PinService } from '../../../src/domain';

describe('test text service', () => {

  let memoryStorage = new MemoryStorage();
  let service = new PinService(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    memoryStorage.set('pins', [getPin(), '1234', getPin()]);
    service = new PinService(memoryStorage);
  });

  test('should return true if pin is correct', () => {
    expect(service.checkPin('1234')).toBeTruthy();
  });

  test('should return false if pin is incorrect', () => {
    expect(service.checkPin('123')).toBeFalsy();
    expect(service.checkPin('12345')).toBeFalsy();
  });

  test('pin should be valid', () => {
    memoryStorage.set('pin-validation', Math.trunc(Date.now() / 1000) + 10); // valid for the next 10 seconds
    expect(service.isValid()).toBeTruthy();
  });

  test('pin should be invalid', () => {
    memoryStorage.set('pin-validation', Math.trunc(Date.now() / 1000) - 10); // invalid since 10 seconds
    expect(service.isValid()).toBeFalsy();
  });

  test('should validate correct pin for 2 hour', () => {
    expect(service.validatePin('1234', 2)).toBeTruthy();
    const pinValidation = parseInt(memoryStorage.get('pin-validation'));
    expect(pinValidation).toEqual(Math.trunc(Date.now() / 1000) + (2 * 60 * 60));
  });

  test('should not require pin validation if pins are not set in storage', () => {
    memoryStorage.unset('pins');
    expect(service.isPinValidationRequired()).toBeFalsy();
  });

  test('should not require pin validation if pins are set but empty', () => {
    memoryStorage.set('pins', []);
    expect(service.isPinValidationRequired()).toBeFalsy();
  });

  test('should require pin validation if pins are set', () => {
    memoryStorage.set('pins', ['1234']);
    expect(service.isPinValidationRequired()).toBeTruthy();
  });
});
