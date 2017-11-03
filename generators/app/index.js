const Generator = require('yeoman-generator');
const ejs = require('ejs');
const fs = require('fs');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('name', {type: String, required: false});
    this.option('index');
  }

  prompting() {
    if (this.options.name) {
      this.name = this.options.name;
      return;
    }

    return this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name (Singular):',
      }
    ])
    .then(answers => {
      this.name = answers.name;
    });
  }

  writing() {
    const name = this.name.toLowerCase();
    const suffix = /y$/.test(name) ? 'ies' : 's';
    const end = suffix === 'ies' ? name.length - 1 : name.length;
    const names = {
      Title: name.charAt(0).toUpperCase() + name.substr(1, end) + suffix,
      TitleSingular: name.charAt(0).toUpperCase() + name.substr(1),
      title: name.substr(0, end) + suffix,
      titleSingular: name,
    };

    if (this.options.index) {
      const tmpl = fs.readFileSync(this.templatePath('./index.js')).toString();
      console.log(ejs.render(tmpl, names));
      return;
    }

    this.fs.copyTpl(
      this.templatePath('./router/*.ts'),
      this.destinationPath(names.title),
      names
    )
  }
};
