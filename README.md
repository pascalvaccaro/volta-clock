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
  - **snooze** (*optional*): should the alarm ring multiple times
- Delete an alarm

> All datetimes *should* be displayed in local values but *must* be stored in UTC values.

## Notes

### Dev mode

- It takes .6~.8 second for the scheduler to load the worker 
- It takes ~.001 second for the main process to pass the worker's message through to the renderer process

## Next steps

First, enhance the `Alarm` model by:

- selecting a sound from the user's filesystem instead of an application-generated sound
- repeating the alarm periodically (*every N hour/day/week/month*)

In a further stage, the application can expand to include:
- a timer
- a countdown
- a world-clock with a weather feature
