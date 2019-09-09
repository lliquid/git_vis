from flask import Blueprint

views = Blueprint("views", __name__, url_prefix='/', template_folder="../js/dashboard/build", static_folder="../js/dashboard/build/static", static_url_path='/static')
api = Blueprint("api", __name__, url_prefix='/api/v1')

from backend.views import *
from backend.api import *
