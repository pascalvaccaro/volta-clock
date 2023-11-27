# Volta Clock

> A simple alarm-clock built with Electron, React and Typescript


## Installation/Development

Checkout [INSTALL.md](./INSTALL.md)

## Features

- Show the current datetime on the front page
- Display a list of saved alarms on the front page
- Show a detailed view of a saved alarm
- Create or edit an alarm with the following fields:
  - **datetime** (*required*): when will the alarm ring
  - **active** (*default to true*): should the alarm ring
  - **name** (*optional*): a custom name for this alarm
- Delete an alarm

> All datetimes *should* be displayed in local values but *must* be stored in UTC values.

## Architecture

- [Electron](https://www.electronjs.org/): application manager handling:
  - the main process (Node)
  - the renderer process (React)
- [Bree](https://github.com/breejs/bree): background-jobs scheduler
- [RxDB](https://rxdb.info/quickstart.html): data-storage manager
- [Redux Tool Kit](https://redux-toolkit.js.org/): UI state manager
- [Ant Design](https://ant.design/): UI design library


The main process in Electron orchestrates inter-process communication with various implementations of the [Worker Threads API](https://nodejs.org/docs/latest-v18.x/api/worker_threads.html) (*node*) and the [Channel Messaging API](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API) (*web*)
- main <-> renderer: default IPC set up by [Electron](https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way) *(implemented in the [preload script](./src/main/preload.ts) and the [IPC hook](./src/renderer/hooks/ipc.ts))*
- main <-> worker: default messaging system provided by [Bree](https://github.com/breejs/bree#instance-options) *(implemented in [scheduler.ts](./src/main/scheduler.ts) via a [`parentPort`](https://nodejs.org/docs/latest-v18.x/api/worker_threads.html#workerparentport))*
- storage <-> renderer: custom messaging system provided by the [RxDB electron plugin](https://rxdb.info/electron.html#rxstorage-electron-ipcrenderer--ipcmain) *(implemented in the [preload script](./src/main/preload.ts:7-11) and [listener.ts](./src/renderer/store/listener.ts))*
- storage <-> worker: custom messaging system *(implemented in [storage.ts](./src/main/storage.ts) and [worker.ts](./src/main/worker.ts) via a [`RxDBRemoteStorage`](https://rxdb.info/rx-storage-remote.html))*

All messages addressed to the renderer process are piped through the Redux Tool Kit [listener middleware](https://redux-toolkit.js.org/api/createListenerMiddleware#overview) to handle dispatching asynchronous/time-related actions *(implemented in the [epics](./src/renderer/store/epics.ts) module)*

All dates are created with [Day.js](https://day.js.org/en/) (parsing, manipulation, i18n, l10n, etc.)


## Caveats

1. The store works fine, but it should be configured with the database connection ***already*** defined. For now, there is a wrapper around each listener's effect to add the connection on the fly to the `extra` argument of the [RTK Listener API](https://redux-toolkit.js.org/api/createListenerMiddleware#listener-api). This would remove a condition when running the effect (not a big performance gain but still it's ***not neat***)
2. In the development environment, it is common to get ***either*** the React dev-tools extension ***or*** the Redux dev-tools extension working. It seems that whenever one is working, the other one crashes (even more so with hot-reloading enabled)


## Next steps

1. Enhance the `Alarm` model by:

   - snoozing an alarm that's ringing (*ring again in 3/5/10 minutes*)
   - prioritizing alarms with specific sound bips (*higher sound -> higher priority*)
   - repeating the alarm periodically (*every N hour/day/week/month*)

2. Encapsulate the app into an icon tray:
   
   - open the notifications on the desktop rather than the renderer's window *(it may not always be opened to show them)*
   - move the renderer's window to a kind of system widget *(like the weather app or the real clock of a classic desktop environment)*

3. Expand the app to include more pages related to a time-based model:
   - a timer
   - a countdown
   - a world-clock with a weather feature
