export default class Server {
  constructor(name) {
    this.name = name;
    this.prefixes = [];
    this.support = {};
  }

  recordSupport(key, value) {
    if (key == 'PREFIX') {
      let matches = value.match(/\((.+)\)(.+)/);
      let prefixes = matches[2].split('');
      if (prefixes) {
        prefixes.forEach((prefix) => {
          this.prefixes.push(prefix);
        });
        this.prefixes.push('');
      }
    }

    this.support[key] = value;
  }
}
