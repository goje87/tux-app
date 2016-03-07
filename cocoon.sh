#!/bin/bash

sh npmInstallGlobal.sh cordova@latest cocoonjs

# make current project as cocoonjs project
cocoonjs create . $1 $2

# currently only android is supported. TODO: provide platforms as arguments
cocoonjs platform add android
cocoonjs plugin add com.ludei.webview.plus
