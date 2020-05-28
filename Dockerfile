# set this to false if you want to use licensed fonts
ARG USE_ALT_FONTS=true

# --- fetch oss fonts ---
FROM alpine:latest AS fonts

WORKDIR /build

RUN apk --update add git wget unzip && \
    rm -rf /var/lib/apt/lists/* && \
    rm /var/cache/apk/*

# download fonts
RUN wget -O fira.zip https://bboxtype.com/downloads/Fira/Fira_Mono_3_2.zip && unzip fira.zip
RUN git clone https://github.com/BlackFoundryCom/InriaFonts.git && cd InriaFonts && git checkout 8caa79a
RUN wget -O alegreya.zip https://www.huertatipografica.com/free_download/134 && unzip alegreya.zip -d alegreya

# --- build kamome ---
FROM node:13.10.1 AS build-kamome
ARG USE_ALT_FONTS

WORKDIR /build

# dependencies
COPY package.json yarn.lock /build/
RUN yarn install --ignore-optional --non-interactive

# copy free fonts
COPY --from=fonts /build/alegreya/Alegreya-Regular.woff2 /build/static/fonts/alegreya-regular.woff2
COPY --from=fonts /build/alegreya/Alegreya-Italic.woff2 /build/static/fonts/alegreya-italic.woff2
COPY --from=fonts /build/alegreya/Alegreya-Medium.woff2 /build/static/fonts/alegreya-medium.woff2
COPY --from=fonts /build/alegreya/Alegreya-MediumItalic.woff2 /build/static/fonts/alegreya-medium-italic.woff2
COPY --from=fonts /build/InriaFonts/fonts/InriaSans/Web/InriaSans-Bold.woff2 /build/static/fonts/inria-sans-bold.woff2
COPY --from=fonts /build/Fira_Mono_3_2/Fonts/FiraMono_WEB_32/FiraMono-Regular.woff2 /build/static/fonts/fira-mono-regular.woff2
COPY --from=fonts /build/Fira_Mono_3_2/Fonts/FiraMono_WEB_32/FiraMono-Medium.woff2 /build/static/fonts/fira-mono-medium.woff2
COPY --from=fonts /build/Fira_Mono_3_2/Fonts/FiraMono_WEB_32/FiraMono-Bold.woff2 /build/static/fonts/fira-mono-bold.woff2

COPY . /build/

RUN if [ "$USE_ALT_FONTS" = "true" ]; \
    then mv /build/static/fonts/fonts-oss.css /build/static/fonts/fonts.css; \
    else rm /build/static/fonts/fonts-oss.css /build/static/fonts/*.woff2; \
    fi

RUN yarn build

# --- kamome ---
FROM nginx:latest

RUN rm -v /etc/nginx/nginx.conf

WORKDIR /app

COPY --from=build-kamome /build/dist/ /app/
