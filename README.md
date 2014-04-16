# melkor

[![Build Status](https://secure.travis-ci.org/hiddentao/melkor.png)](http://travis-ci.org/hiddentao/melkor)

A simple, fast wiki powered by Node.js and Git.

## Features

* Git back-end storage
* [Markdown](https://github.com/evilstreak/markdown-js) syntax
* [Responsive](http://getbootstrap.com) layout (small-screen editing)

[![Screenshot](https://raw.githubusercontent.com/hiddentao/melkor/master/screenshots/mobile.png)](https://github.com/hiddentao/melkor/tree/master/screenshots)

## Usage

Melkor uses generators - **Node v0.11.2+ is required**. And ensure you have 
the [Git global user](http://www.git-scm.com/book/ch7-1.html) configured.

```bash
$ npm install -g melkor
$ mkdir mywikifolder
$ cd mywikifolder
$ melkor
```

Browse to http://localhost:4567 to start using the wiki.

Command-line options:

```bash
  Usage: melkor [options]

  Options:

    -h, --help           output usage information
    -p, --port <num>     Port number (Default: 4567)
    -t, --title <title>  Wiki title (Default: Wiki)
```

## Development

    $ npm install -g grunt-cli
    $ npm install -g bower
    $ npm install
    $ bower install
    $ npm run build <-- this will build the code and run the tests

## Why _Melkor_?

Melkor was inspired by [Gollum](https://github.com/github/gollum), named after
another Lord of the Rings character. Melkor itself is the original
name of [Morgoth](https://en.wikipedia.org/wiki/Morgoth), the most powerful
dark lord and biggest badass!

## License

MIT - see LICENSE.md
