# This Website

This website is built with [Jekyll](http://jekyllrb.com) and intended to be
publicly hosted with GitHub Pages. Everyone can contribute to it.

## Requirements

* node.js with gulp
* Ruby

## Prepare

* Fork this repo.
* Clone your fork to your local development desktop.
* Run:
  * ```bundle install``` to install required Ruby gems.
  * ```npm install``` to install required Node.js modules.
  * ```bower install``` to install required JS (and other) libraries.
* Update ```github.conf.json```.
* Update ```jekyll.conf.yml```.
* If you're not hosting for a domain and the site will be served in a sub-folder
  then edit ```jekyll.conf.deploy.yml``` to reflect the path it will be hosted
  in.

### Update ```package.json```

Before starting a new project, update the information in ```package.json```.
You can update the required packages' versions with:

* If you don't have it yet: ```npm install -g npm-check-updates```.
* ```npm-check-updates -u```

## Development

To serve a local copy of the site with BrowserSync while developing, from the
root ```/DrupalAssociationSA.github.io``` run ```gulp```

Any line of the commit message cannot be longer 100 characters! This allows the
message to be easier to read on github as well as in various git tools.

## Files

* **```app```**
  The Jekyll website source files. This is where site development happens.
* ```bower.json``` and ```.bowerrc```
  Bower configuration and site asset requirements like JS and front-end
  frameworks.
* ```CNAME```
  (optional) domain you will point to GitHub for hosting the site.
* ```Gemfile[.lock]```
  Ruby gem requirements installed with ```bundle install```.
* ```github.conf.json```
  Configuration file used by Gulp setup to deploy to GitHub pages.
* ```gulpfile.js```
  Gulp tasks.
* ```jekyll.conf.yml``` and ```jekyll.conf.*.yml```
  Jekyll configuration files.
* ```package.json```
  Node Package Manager project metadata and Node Packaged Modules requirements
  installed with ```npm install```.
* ```readme.md```
  This file you're reading now.
* ```serve```
  Where the locally served site is built to.
* ```.git```, ```.gitattributes``` and ```.gitattributes```
  Git related configuration and local repository.
* ```.sass-cache```
  Sass cache.
* ```.tmp```
  Intermediate build steps' assets.
