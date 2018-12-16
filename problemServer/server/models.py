from django.db import models

# Create your models here.


class UserProblem(models.Model):
    userID = models.CharField(max_length=1000)
    question = models.CharField(max_length=1000)
    answer = models.CharField(max_length=1000)
