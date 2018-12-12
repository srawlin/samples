from django.db import transaction
from rest_framework import filters, viewsets
from rest_framework.decorators import detail_route
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Organization, Submission
from .serializers import (
    OrganizationCreateSerializer,
    OrganizationSerializer,
    OrganizationSubmitSerializer,
    SubmissionListSerializer,
    SubmissionRespondSerializer,
)


class OrganizationViewSet(viewsets.ModelViewSet):

    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrganizationCreateSerializer
        return self.serializer_class

    @detail_route(methods=['POST'])
    def submit(self, request, slug=None):
        instance = self.get_object()
        serializer = OrganizationSubmitSerializer(
            instance=instance,
            data=request.data
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(submitted_by=self.request.user)
        return Response({
            'OK': True,
        })


class SubmissionBaseViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Submission.objects.all()
    serializer_class = SubmissionListSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    pagination_class = LimitOffsetPagination
    filter_fields = ('status',)
    permission_classes = (IsAuthenticated,)

    ordering_fields = ('created_at',)
    ordering = ('-created_at',)


class SubmissionReviewerViewSet(SubmissionBaseViewSet):

    def get_queryset(self):
        return Submission.objects.filter(
            organization__in=self.request.user.reviewing_organizations.all()
        ).order_by('charge__created_at', 'created_at',)

    @transaction.atomic()
    @detail_route(methods=['POST'])
    def respond(self, request, pk=None):
        submission = self.get_object()
        serializer = SubmissionRespondSerializer(
            instance=submission, data=request.data,
            context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()
        queryset = self.get_queryset().filter(status=Submission.STATUS.new)
        queryset = self.paginate_queryset(queryset)
        return self.get_paginated_response(
            self.get_serializer(queryset, many=True).data
        )


class SubmissionSubmitterViewSet(SubmissionBaseViewSet):

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated:
            return user.submissions.all()
        return Submission.objects.none()
