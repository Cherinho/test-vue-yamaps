<template>
  <yandex-map
    :settings="settings"
    :coords="coords"
    :zoom="zoom"
    class="map"
    @map-was-initialized="mapInitialized"
    @click="onClick"
  >

  </yandex-map>
</template>

<script>
import { yandexMap, loadYmap } from 'vue-yandex-maps';
import { mapMutations } from 'vuex';

const config = require('../config.json');

export default {
  name: 'Map',
  components: {
    yandexMap,
  },
  async mounted() {
    await loadYmap(config.yamaps);
  },
  data: () => ({
    settings: config.yamaps,
    coords: [55.73, 37.75],
    markerCoords: [],
    zoom: 9,
    map: null,
  }),
  methods: {
    ...mapMutations(['addBaloon']),
    mapInitialized(instance) {
      this.map = instance;
      // eslint-disable-next-line no-undef
      const polygon = new ymaps.Polygon(config.coordinates);
      polygon.options.set('visible', true);
      this.map.geoObjects.add(polygon);
    },
    onClick(e) {
      this.markerCoords = e.get('coords');
    },
  },
  watch: {
    markerCoords(newVal) {
      const closestPoint = this.map.geoObjects
        .get(0)
        .geometry
        .getClosest(newVal).position;

      this.addBaloon(newVal);

      this.map.geoObjects.splice(1, this.map.geoObjects.getLength());
      // eslint-disable-next-line no-undef
      ymaps.route([newVal, closestPoint], { reverseGeocoding: true }).then((res) => {
        res.getWayPoints().each((point) => {
          point.options.set({
            // eslint-disable-next-line no-undef
            iconContentLayout: ymaps.templateLayoutFactory.createClass('{{ properties.request|raw }}'),
          });
        });
        res.getPaths().options.set({
          strokeColor: 'ff00ff',
        });
        this.map.geoObjects.add(res);
      });
      // eslint-disable-next-line no-undef
      this.map.geoObjects.add(new ymaps.Polyline([newVal, closestPoint], {},
        {
          strokeColor: '000',
          strokeStyle: 'dash',
        }));
    },
  },
};
</script>

<style>
.map {
  height: 100vh;
}
</style>
