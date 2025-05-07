FROM nicolargo/glances:latest-full
COPY glances.conf /glances/conf/glances.conf
RUN /venv/bin/python3 -m pip install graphitesend
CMD /venv/bin/python3 -m glances -C /glances/conf/glances.conf $GLANCES_OPT
