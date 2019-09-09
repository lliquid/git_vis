# -*- coding: utf-8 -*-
"""
Your amazing flask views
"""
from backend import views

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    url_for,
)
from flask_login import login_required, login_user, logout_user


@views.route("/", methods=["GET", "POST"])
def home():
    """Home page."""
    current_app.logger.info("Hello from the home page!")
    return render_template("index.html")


@views.route("/about/")
def about():
    """About page."""
    return render_template("about.html")

