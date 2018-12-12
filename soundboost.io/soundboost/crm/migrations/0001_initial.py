# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-12-15 15:29
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(blank=True, max_length=50, null=True)),
                ('last_name', models.CharField(blank=True, max_length=50, null=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('organization_name', models.CharField(blank=True, max_length=50, null=True)),
                ('kind', models.CharField(choices=[('soundcloud', 'Soundcloud'), ('youtube', 'Youtube'), ('blog', 'blog')], default='blog', max_length=20)),
                ('alexa_rank', models.PositiveIntegerField(null=True)),
                ('url', models.URLField(blank=True, null=True)),
                ('blog_software', models.CharField(blank=True, choices=[('wordpress', 'WordPress')], max_length=20, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('genre', models.CharField(blank=True, max_length=50, null=True)),
                ('status', models.CharField(blank=True, choices=[('contacted', 'Contacted'), ('responded', 'Responded'), ('joined', 'Joined'), ('active', 'Active')], max_length=20, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='SentEmail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('template', models.CharField(max_length=50)),
                ('contact', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='crm.Contact')),
            ],
        ),
    ]