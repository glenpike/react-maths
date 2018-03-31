React-Maths

Simple game / app for testing times-tables.

Built with [create-react-app](https://github.com/facebook/create-react-app)


# normalize.css

Is using normalize.css, but imported into SASS.  There is a workaround to get this to behave
- node-sass can't @import css files, so we create a symlink with an .scss extension to
point at the node module...
https://foundation.zurb.com/forum/posts/17157-sass-and-normalizecss
Probably shouldn't be doing this, but it's working for now.
