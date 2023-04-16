#!/bin/bash
cd '/react-frontend'
npm install

cd '../Django-backend'
python3 -m pip install Django
python3 -m venv ./venv
source venv/bin/activate
pip install djangorestframework
pip install --upgrade djangorestframework-simplejwt
pip install Pillow
pip install django-filter
python3 manage.py makemigrations
python3 manage.py migrate


