# KGViewer

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![CUDA](https://img.shields.io/badge/CUDA-12.4-green)](https://developer.nvidia.com/cuda-downloads)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.5.0-red)](https://pytorch.org/get-started/locally/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[![Forks](https://img.shields.io/github/forks/MouYongli/Dugle?style=social)](https://github.com/MouYongli/Dugle/network/members)
[![Stars](https://img.shields.io/github/stars/MouYongli/Dugle?style=social)](https://github.com/MouYongli/Dugle/stargazers)
[![Issues](https://img.shields.io/github/issues/MouYongli/Dugle)](https://github.com/MouYongli/Dugle/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/MouYongli/Dugle)](https://github.com/MouYongli/Dugle/pulls)
[![Contributors](https://img.shields.io/github/contributors/MouYongli/Dugle)](https://github.com/MouYongli/Dugle/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/MouYongli/Dugle)](https://github.com/MouYongli/Dugle/commits/main)
<!-- [![Build Status](https://img.shields.io/github/actions/workflow/status/MouYongli/Dugle/ci.yml)](https://github.com/MouYongli/Dugle/actions)
[![Code Quality](https://img.shields.io/lgtm/grade/python/g/MouYongli/Dugle.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/MouYongli/Dugle/context:python) -->

[![Docker](https://img.shields.io/badge/Docker-Supported-blue)](https://hub.docker.com/r/YOUR_DOCKER_IMAGE)
[![Colab](https://img.shields.io/badge/Open%20in-Colab-yellow)](https://colab.research.google.com/github/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/blob/main/notebooks/demo.ipynb)
[![arXiv](https://img.shields.io/badge/arXiv-XXXX.XXXXX-b31b1b.svg)](https://arxiv.org/abs/XXXX.XXXXX)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.xxxxxx.svg)](https://doi.org/10.5281/zenodo.xxxxxx)


[![WeChat](https://img.shields.io/badge/WeChat-公众号名称-green)](https://your-wechat-link.com)
[![Weibo](https://img.shields.io/badge/Weibo-关注-red)](https://weibo.com/YOUR_WEIBO_LINK)
<!-- [![Discord](https://img.shields.io/discord/YOUR_DISCORD_SERVER_ID?label=Discord&logo=discord&color=5865F2)](https://discord.gg/YOUR_INVITE_LINK) -->
<!-- [![Twitter](https://img.shields.io/twitter/follow/YOUR_TWITTER_HANDLE?style=social)](https://twitter.com/YOUR_TWITTER_HANDLE) -->


## Overview

## Features

## Installation

#### Anaconda
1. create conda environment
```bash
conda create --name kgviewer python=3.10
conda activate kgviewer
```

2. Install Jupyter lab and kernel
```bash
conda install -c conda-forge jupyterlab
conda install ipykernel
```

3. Install dependencies
```bash
pip install -e .
```

4. Run app
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
#### Docker


```

---

<!-- Developed by **Your Name** | [LinkedIn](https://linkedin.com/in/YOURNAME) | [Twitter](https://twitter.com/YOURHANDLE) -->