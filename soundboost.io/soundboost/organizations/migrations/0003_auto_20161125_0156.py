# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-25 01:56
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0002_submission_submitted_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='html',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='song',
            name='title',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
    ]
