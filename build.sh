#!/bin/bash

rm kojslint.xpi
rm kojslint.zip
zip -r kojslint.zip chrome.manifest install.rdf components chrome
mv kojslint.zip kojslint.xpi

