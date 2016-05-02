import Buffer from './buffer';

export default class BufferManager {
  constructor(client) {
    this.client = client;
    this.buffers = {};
  }

  delete(buffer) {
    delete this.buffers[buffer.parent][buffer.name];
    this.client.browserWindow.webContents.send('buffer:delete', buffer);
  }

  deleteParent(parent) {
    for (let child in this.buffers[parent]) {
      if (this.buffers[parent].hasOwnProperty(child)) {
        this.client.browserWindow.webContents.send(
          'buffer:delete', this.buffers[parent][child]);
        delete this.buffers[parent][child];
      }
    }
    delete this.buffers[parent];
  }

  find(args) {
    if (!args.parent) {
      args.parent = 'default';
    }

    if (!this.buffers[args.parent]) {
      return null;
    }

    return this.buffers[args.parent][args.name] || null;
  }

  create(args) {
    let buffer = this.find(args);
    let webContents = this.client.browserWindow.webContents;

    if (!args.parent) {
      args.parent = 'default';
    }

    if (buffer) {
      // Buffer already exists
      throw new Error('Buffer %s-%s already exists', args.parent, args.name);
    }

    if (!this.buffers[args.parent]) {
      this.buffers[args.parent] = {};
    }

    buffer = this.buffers[args.parent][args.name] = new Buffer(args);

    // Attach buffer listeners
    // Ideally, it would be better to have the components handle these but the
    // Buffer instance is converted to an Object when passed to the renderer.
    buffer.on('message', (message) => {
      webContents.send('buffer:message', buffer, message);
    }).on('names', (names) => {
      webContents.send('buffer:names', buffer, names);
    }).on('switch', () => {
      webContents.send('buffer:switch', buffer);
    }).on('topic', (topic) => {
      webContents.send('buffer:topic', buffer, topic);
    });

    // Inform the renderer about the new buffer
    webContents.send('buffer:create', buffer);

    return buffer;
  }

  findOrCreate(args) {
    let buffer = this.find(args);
    if (!buffer) {
      buffer = this.create(args);
    }
    return buffer;
  }
}
