Notes
=====

Fonts in this directory are licensed so they are not on GitHub.

To purchase/download them, refer to the links below.

- [Garibaldi](https://www.harbortype.com/fonts/garibaldi/)
- [Graviola Soft](https://www.harbortype.com/fonts/graviola-soft/)
- [Fira Mono](https://mozilla.github.io/Fira/)

There is also an alternative set of free fonts,

- [Alegreya ht](https://www.huertatipografica.com/en/fonts/alegreya-ht-pro)
- [Inria Sans](https://black-foundry.com/work/inria/)
- [Fira Mono](https://mozilla.github.io/Fira/)

which are listed in `fonts-oss.css`. You can opt to use them by setting the
argument `USE_ALT_FONTS` to `true` when building the Docker image (this is the
default). If you don't want to use them, set `USE_ALT_FONTS` to `false` either
in the command line or in the [`docker-compose.yml`][docker-compose] file.

[docker-compose]: https://github.com/Krasjet/karasu/blob/master/docker-compose.yml
