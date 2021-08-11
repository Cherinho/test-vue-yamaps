<template>
  <yandex-map
    :settings="settings"
    :coords="coords"
    :zoom="zoom"
    class="map"
    @map-was-initialized="mapInitialized"
    @click="onClick"
  >
    <ymap-marker :coords="markerCoords" marker-id="1"></ymap-marker>
  </yandex-map>
</template>

<script>
import { yandexMap, loadYmap, ymapMarker } from 'vue-yandex-maps';

const coordinates = require('../coordinates.json');

export default {
  name: 'Map',
  components: {
    yandexMap,
    ymapMarker,
  },
  async mounted() {
    await loadYmap({ apiKey: 'cddd8039-fd64-4614-8915-8a38cf2dc192', debug: true });
  },
  data: () => ({
    settings: {
      apiKey: 'cddd8039-fd64-4614-8915-8a38cf2dc192',
    },
    coords: [55.73, 37.75],
    markerCoords: [],
    zoom: 9,
    map: null,
  }),
  methods: {
    // eslint-disable-next-line no-unused-vars
    mapInitialized(instance) {
      this.map = instance;
      // eslint-disable-next-line no-undef
      const polygon = new ymaps.Polygon(coordinates.coordinates);
      polygon.options.set('visible', true);
      this.map.geoObjects.add(polygon);
    },
    onClick(e) {
      this.markerCoords = e.get('coords');
    },
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    markerCoords(newVal) {
      // eslint-disable-next-line no-undef
      const closestPoint = this.map.geoObjects
        .get(0)
        .geometry
        .getClosest(newVal).position;
      this.map.geoObjects.splice(1, this.map.geoObjects.getLength());
      // eslint-disable-next-line no-undef
      ymaps.route([newVal, closestPoint]).then((res) => {
        res.getPaths().options.set({
          strokeColor: 'ff0000',
        });
        // this.map.geoObjects.each((geoObject) => {
        // this.map.geoObjecs.remove(geoObject);
        // console.log(geoObject.properties.get('type'));
        // console.log(geoObject);
        // });
        this.map.geoObjects.add(res);
      });
      // eslint-disable-next-line no-undef
      this.map.geoObjects.add(new ymaps.Polyline([newVal, closestPoint], { strokeColor: '#000000' }));
      // console.log(polygon.getClosestPoint(newVal));
      // ymaps.route(newVal);
    },
  },
};
</script>

<style>
.map {
  height: 100vh;
}
</style>
