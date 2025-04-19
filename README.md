# TourRec

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![CUDA](https://img.shields.io/badge/CUDA-12.4-green)](https://developer.nvidia.com/cuda-downloads)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.5.0-red)](https://pytorch.org/get-started/locally/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[![Forks](https://img.shields.io/github/forks/MouYongli/TourRec?style=social)](https://github.com/MouYongli/TourRec/network/members)
[![Stars](https://img.shields.io/github/stars/MouYongli/TourRec?style=social)](https://github.com/MouYongli/TourRec/stargazers)
[![Issues](https://img.shields.io/github/issues/MouYongli/TourRec)](https://github.com/MouYongli/TourRec/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/MouYongli/TourRec)](https://github.com/MouYongli/TourRec/pulls)
[![Contributors](https://img.shields.io/github/contributors/MouYongli/TourRec)](https://github.com/MouYongli/TourRec/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/MouYongli/TourRec)](https://github.com/MouYongli/TourRec/commits/main)
<!-- [![Build Status](https://img.shields.io/github/actions/workflow/status/MouYongli/TourRec/ci.yml)](https://github.com/MouYongli/TourRec/actions)
[![Code Quality](https://img.shields.io/lgtm/grade/python/g/MouYongli/TourRec.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/MouYongli/TourRec/context:python) -->

[![Docker](https://img.shields.io/badge/Docker-Supported-blue)](https://hub.docker.com/r/YOUR_DOCKER_IMAGE)
[![Colab](https://img.shields.io/badge/Open%20in-Colab-yellow)](https://colab.research.google.com/github/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/blob/main/notebooks/demo.ipynb)
[![arXiv](https://img.shields.io/badge/arXiv-XXXX.XXXXX-b31b1b.svg)](https://arxiv.org/abs/XXXX.XXXXX)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.xxxxxx.svg)](https://doi.org/10.5281/zenodo.xxxxxx)


[![WeChat](https://img.shields.io/badge/WeChat-公众号名称-green)](https://your-wechat-link.com)
[![Weibo](https://img.shields.io/badge/Weibo-关注-red)](https://weibo.com/YOUR_WEIBO_LINK)
<!-- [![Discord](https://img.shields.io/discord/YOUR_DISCORD_SERVER_ID?label=Discord&logo=discord&color=5865F2)](https://discord.gg/YOUR_INVITE_LINK) -->
<!-- [![Twitter](https://img.shields.io/twitter/follow/YOUR_TWITTER_HANDLE?style=social)](https://twitter.com/YOUR_TWITTER_HANDLE) -->

This is official repo for "Knowledge Graph-based Tourism Recommendation System" by DBIS at RWTH Aachen University ([Yongli Mou*](mou@dbis.rwth-aachen.de), Ziyi Xu and Stefan Decker)

## Overview


## Components
- Frontend (Next.js): The user interface is built with Next.js. The frontend communicates with the backend (Flask) to handle the logic and AI operations.

- Backend (Flask): The backend is built with Flask, handling API requests, interacting with databases, running AI models, and serving the AI-generated tourism recommendations to the frontend.
  
- Databases:
  - Postgres is used to store and manage structured user and system data
  - Neo4j (Graph Database) is used to store and manage knowledge graphs
  - Vector Database (e.g., FAISS or similar)
  - 
## Installation

### Manual installation


### Docker-compose


## Usage

More detailed tutorials can be found in our [documentation](https://your-project-website.com/docs).

## Project Structure

```
📦 TourRec
├── 📁 docs                # Documentation and API references
├── 📁 frontend     
├── 📁 backend         
├── 📁 docker        
│   ├── 📁 frontend
│   ├── 📁 backend
│   ├── ...
│   └── docker-compose.yml
├── Makefile    
├── LICENSE    
└── README.md             
```


## Internationalization (i18n)

TourRec supports English, Chinese, and German languages, implemented using `react-i18next` and `i18next` with dynamic language switching, JSON translation texts, and modularized file structure. To add a new language, update `settings.ts`, create a new language folder, add a translation file, and update the language switcher component.
More information in the [i18n README](frontend/src/i18n/README.md)


## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
<!-- ---Developed by **Your Name** | [LinkedIn](https://linkedin.com/in/YOURNAME) | [Twitter](https://twitter.com/YOURHANDLE) -->
