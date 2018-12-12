from django.contrib.auth import logout
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.models import User

from .serializers import (
    UserSerializer
)


class UserDetail(viewsets.ModelViewSet):
    """
    Retrieve info about the current user
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        else:
            return User.objects.filter(id=self.request.user.id)

    @list_route(methods=['GET'], permission_classes=(IsAuthenticated,))
    def current(self, request):
        serializer = UserSerializer(self.request.user)
        return Response(serializer.data)


def logout_view(request):
    """Logout Session authentiated Users from py-social-auth"""
    logout(request)
    return HttpResponse(status=200)
