#!/bin/bash
set -e
conda install -y yarn -c conda-forge
pip install -r ./engine/requirements/dev.txt
conda install -y jupyter -c conda-forge
conda install -y rsync -c conda-forge

