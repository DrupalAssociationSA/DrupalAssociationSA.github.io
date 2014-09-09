# DrupalAssociationSA.github.io

The Drupal Association South Africa (DASA) website.

The dasa.org.za site is built with [Jekyll](http://jekyllrb.com) and publicly hosted on GitHub Pages at <http://dasa.org.za>. The site may also be run locally.

## Contribute

Help build and contribute to the DASA website.

### Requirements

* node.js
* Ruby

### Prepare

* Fork this repo.
* Clone your fork to your local development desktop.
* Run:
  * ```bundle install```
  * ```npm install```
  * ```bower install```

### Use

To serve a local copy of the site with BrowserSync while developing, from the root ```/DrupalAssociationSA.github.io``` run ```gulp```

### Commit Message Format
Commit messages should have the following a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on github as well as in various git tools.

### Commit Message Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Windows

**Windows users:** run `chcp 65001` first to change the command prompt's character encoding ([code page](http://en.wikipedia.org/wiki/Windows_code_page)) to UTF-8 so Jekyll runs without errors.



