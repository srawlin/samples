# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-26 21:55
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0007_auto_20161126_1558'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='song',
            name='html',
        ),
    ]
