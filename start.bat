@echo off

SET KITSU_API_TARGET=https://wekitsu.weloadin.lol/api
SET KITSU_EVENT_TARGET=https://wekitsu.weloadin.lol/socket.io

echo KITSU_API_TARGET is set to: %KITSU_API_TARGET%
echo KITSU_EVENT_TARGET is set to: %KITSU_EVENT_TARGET%

npm run dev
