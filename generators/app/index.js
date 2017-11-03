const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('name', {type: String, required: false});
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
    const suffix = 's';
    const names = {
      Title: name.charAt(0).toUpperCase() + name.substr(1) + suffix,
      TitleSingular: name.charAt(0).toUpperCase() + name.substr(1),
      title: name + suffix,
      titleSingular: name,
    };

    this.fs.copyTpl(
      this.templatePath('./*.ts'),
      this.destinationPath(names.title),
      names
    )
  }
};
