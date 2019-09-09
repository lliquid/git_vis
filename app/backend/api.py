# -*- coding: utf-8 -*-
"""
Your amazing flask api
"""
from backend import api

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    url_for,
    jsonify
)
from flask_login import login_required, login_user, logout_user


@api.route("/", methods=["GET", "POST"])
def test():
    return jsonify({"hello": "world"})


