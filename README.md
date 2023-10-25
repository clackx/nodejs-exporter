# Nodejs exporter

Node.js реализация экспортера метрик, аналогичного [node_exporter](https://github.com/prometheus/node_exporter/)

### Собирает метрики 
- процессорного времени
- использования (IO) диска
- свободного места на дисках
- использования памяти процессами
- свободной памяти RAM / Swap
- использования сети

### Требуется Linux и утилиты:
- iostat из пакета sysstat
- df из пакета coreutils
- ip из пакета iproute2

Один из вариантов визуализации в Grafana:

![Page1](grafana/page1.png?raw=true)
![Page2](grafana/page2.png?raw=true)


JSON для импорта этого дашбоарда находится в grafana/

##

Node.js implementation of the metrics exporter similar to [node_exporter](https://github.com/prometheus/node_exporter/)

### Collects metrics of
- processor time
- disk usage (IO)
- free space on disks
- memory usage by processes
- free memory RAM / Swap
- network usage

### Required Linux and utilities:
- iostat from sysstat package
- df from coreutils package
- ip from iproute2 package

JSON dashboard for import is available in grafana/ folder
