#!/bin/bash
cd '/react-frontend'
npm install

cd '../Django-backend'
python3 -m pip install Django
python3 -m venv ./venv
source venv/bin/activate
pip install -r requirements.txt
python3 manage.py makemigrations
python3 manage.py migrate


