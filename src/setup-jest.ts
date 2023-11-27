import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

window.electron = {
  ipcStorage: {
    on: jest.fn(),
    removeListener: jest.fn(),
    postMessage: jest.fn(),
  },
  ipcRenderer: {
    sendMessage: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
  },
};
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
