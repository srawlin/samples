# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-12 05:13
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('slug', models.SlugField(unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Reviewer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviewers', to='organizations.Organization')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviewing_organizations', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Song',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('kind', models.CharField(choices=[('soundcloud', 'Soundcloud'), ('youtube', 'Youtube')], max_length=20)),
                ('url', models.URLField()),
            ],
        ),
        migrations.CreateModel(
            name='Submission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('new', 'New'), ('approved', 'Approved'), ('declined', 'Declined')], default='new', max_length=20)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submissions', to='organizations.Organization')),
                ('song', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submissions', to='organizations.Song')),
            ],
        ),
        migrations.AddField(
            model_name='organization',
            name='songs',
            field=models.ManyToManyField(through='organizations.Submission', to='organizations.Song'),
        ),
        migrations.AddField(
            model_name='organization',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
