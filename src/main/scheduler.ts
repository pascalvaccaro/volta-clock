import Bree, { type PluginFunc } from 'bree';
import path from 'node:path';
import process from 'node:process';
import withTypescript from '@breejs/ts-worker';
import type { WebContents } from 'electron';

const withElectron: PluginFunc = (_, Bree) => {
  const protoStart = Bree.prototype.start;

  Bree.prototype.start = async function start(name, port?: WebContents) {
    if (!port) return protoStart.call(this, name);
    this.config.workerMessageHandler = (ev) => {
      if (ev.name === name) port.send(ev.message.channel, ev.message.body);
    };
    return protoStart.call(this, name);
  };
};
Bree.extend(withTypescript);
Bree.extend(withElectron);

const bree = new Bree({
  root: path.resolve(__dirname, 'jobs'),
  defaultExtension: process.env.NODE_ENV === 'development' ? 'ts' : 'js',
  jobs: [{ name: 'check-alarms', cron: '* * * * *' }],
});

export default bree;
