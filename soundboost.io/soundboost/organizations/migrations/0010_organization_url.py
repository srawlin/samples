# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-12-03 14:08
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0009_organization_reviewers'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='url',
            field=models.CharField(default='', max_length=80),
            preserve_default=False,
        ),
    ]