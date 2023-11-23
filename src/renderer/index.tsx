import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import App from './App';
import store from './store';

dayjs.locale('fr');
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
