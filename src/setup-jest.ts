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
