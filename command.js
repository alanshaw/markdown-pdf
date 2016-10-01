#!/usr/bin/env node

require('coffee-script/register')
Command = require('./command.coffee')
new Command().run()
