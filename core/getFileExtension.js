'use strict';

module.exports = src => (src.match(/(?<=\.)([^.]+)$/) || [null])[0];
