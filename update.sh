#!/bin/bash

cd ./static/guides/karasu/ && rm -f index.html && wget https://karasu.krasjet.com/view/tut-karasu/ && sed -i "s/ target=\"_blank\"//g" index.html

cd ../kamome/ && rm -f index.html && wget https://karasu.krasjet.com/view/tut-kamome/ && sed -i "s/ target=\"_blank\"//g" index.html
