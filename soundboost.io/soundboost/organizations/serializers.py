from django.db import transaction
from rest_framework import serializers
from rest_framework_jwt.utils import jwt_encode_handler, jwt_payload_handler

from billing.utils import charge_user
from users.models import User
from users.serializers import UserListSerializer, UserSerializer

from .models import Comment, Organization, Reviewer, Song, Submission


class SongSerializer(serializers.ModelSerializer):

    class Meta:
        model = Song
        fields = ('id', 'title', 'kind', 'url', 'identifier')


class OrganizationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Organization
        fields = (
            'id',
            'name',
            'slug',
            'average_response_time',
            'approval_rate',
            'submissions_today',
        )


class OrganizationCreateSerializer(serializers.ModelSerializer):

    user = UserSerializer()
    jwt_token = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        read_only_fields = ('slug',)
        fields = ('user', 'name', 'url', 'jwt_token', 'slug',)

    def get_jwt_token(self, organization):
        return jwt_encode_handler(jwt_payload_handler(organization.user))

    def create(self, validated_data):
        with transaction.atomic():
            user_data = validated_data.pop('user')
            validated_data['user'] = User.objects.create_user(**user_data)
            organization = Organization.objects.create(**validated_data)
            Reviewer.objects.create(
                organization=organization, user=organization.user
            )
        return organization


class OrganizationSubmitSerializer(serializers.Serializer):

    title = serializers.CharField()
    url = serializers.URLField(allow_null=True, required=False)
    identifier = serializers.CharField(allow_null=True, required=False)
    kind = serializers.ChoiceField(choices=Song.KIND)
    comments = serializers.CharField(required=False, allow_blank=True)
    card_token = serializers.CharField(required=False)

    def non_validate_url(self, url):
        submission = Submission.objects.filter(
            song__url=url,
            organization=self.instance
        )
        if submission.exists():
            raise serializers.ValidationError(
                'This song has already been submitted'
            )
        return url

    def non_validate_identifier(self, identifier):
        submission = Submission.objects.filter(
            song__identifier=identifier,
            organization=self.instance,
        )
        if submission.exists():
            raise serializers.ValidationError(
                'This song has already been submitted'
            )
        return identifier

    def validate(self, data):
        data = super(OrganizationSubmitSerializer, self).validate(data)
        if data['kind'] == Song.KIND.youtube:
            if data.get('url') is not None and not data.get('identifier'):
                raise serializers.ValidationError(
                    'Identifier should be defined for youtube videos'
                )
        elif data['kind'] == Song.KIND.soundcloud:
            if data.get('identifier') is not None and not data.get('url'):
                raise serializers.ValidationError(
                    'Identifier should be defined for soundcloud songs'
                )

        if data.get('url'):
            self.non_validate_url(data.get('url'))
        if data.get('identifier'):
            self.non_validate_identifier(data.get('identifier'))
        return data

    def save(self, submitted_by):
        # TODO: Only receive url, validate and set fields from fetched data
        comments = self.validated_data.pop('comments', None)
        card_token = self.validated_data.pop('card_token', None)
        with transaction.atomic():
            kwargs = {}
            if card_token:
                kwargs['charge'] = charge_user(submitted_by, card_token, 100)
            submission = Submission.objects.create(
                song=Song.objects.create(**self.validated_data),
                organization=self.instance,
                submitted_by=submitted_by,
                **kwargs
            )
            if comments:
                Comment.objects.create(
                    submission=submission,
                    created_by=submitted_by,
                    text=comments,
                )


class SubmissionCommentSerializer(serializers.ModelSerializer):

    created_by = UserListSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('text', 'created_by', 'created_at', 'submission')


class OrganizationSubmissionsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Submission
        fields = ('id', 'created_at', 'status')


class SubmissionListSerializer(serializers.ModelSerializer):

    song = SongSerializer(read_only=True)
    comments = SubmissionCommentSerializer(many=True, read_only=True)
    is_paid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Submission
        fields = (
            'id', 'created_at', 'song', 'status', 'comments', 'organization',
            'is_paid',
        )


class SubmissionRespondSerializer(serializers.Serializer):

    status = serializers.ChoiceField(
        choices=(Submission.STATUS.approved, Submission.STATUS.declined)
    )
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        data = super(SubmissionRespondSerializer, self).validate(data)
        if self.instance.is_paid:
            if not data.get('comment'):
                raise serializers.ValidationError(
                    'Paid submissions must be given feedback'
                )
        return data

    def save(self):
        self.instance.status = self.validated_data['status']
        if 'comment' in self.validated_data and self.validated_data['comment']:
            Comment.objects.create(
                created_by=self.context['view'].request.user,
                submission=self.instance,
                text=self.validated_data['comment']
            )
        self.instance.save()
        return self.instance
