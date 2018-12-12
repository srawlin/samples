from django.conf.urls import include, url
from rest_framework import routers
from rest_framework_jwt.views import obtain_jwt_token

from users.api import logout_view, UserDetail

from .api import (
    OrganizationViewSet,
    SubmissionReviewerViewSet,
    SubmissionSubmitterViewSet,
)


router = routers.DefaultRouter()

router.register(r'organizations', OrganizationViewSet)
router.register(r'submissions/reviewer', SubmissionReviewerViewSet)
router.register(r'submissions/submitter', SubmissionSubmitterViewSet)
router.register(r'users', UserDetail)

urlpatterns = [
    # Authentiation
    url(r'^api-token-auth/', obtain_jwt_token),
    url(r'^logout/', logout_view),

    url(r'^', include(router.urls)),
]
