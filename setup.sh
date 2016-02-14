#!/bin/bash

# Bash function to check whether a given npm package is installed.
# After running this, check the return value ($?). If $? is 0, the npm package
# is installed. If $? is nonzero, the package is not installed.
#
# npm is the package manager for Node.js. See https://www.npmjs.com for info.
isNpmPackageInstalled() {
  npm list --depth 1 -g $1 > /dev/null 2>&1
}

# example
for package in yo bower pm2
do
  if isNpmPackageInstalled $package
  then
      :
  else
      npm install -g $package
  fi
done
